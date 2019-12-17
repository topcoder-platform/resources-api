/**
 * This file defines helper methods
 */

const _ = require('lodash')
const config = require('config')
const request = require('superagent')
const constants = require('../../app-constants')
const models = require('../models')
const errors = require('./errors')
const logger = require('./logger')
const m2mAuth = require('tc-core-library-js').auth.m2m
const m2m = m2mAuth(_.pick(config, ['AUTH0_URL', 'AUTH0_AUDIENCE', 'TOKEN_CACHE_TIME', 'AUTH0_PROXY_SERVER_URL']))
const busApi = require('tc-bus-api-wrapper')
const busApiClient = busApi(_.pick(config, ['AUTH0_URL', 'AUTH0_AUDIENCE', 'TOKEN_CACHE_TIME', 'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET', 'BUSAPI_URL', 'KAFKA_ERROR_TOPIC', 'AUTH0_PROXY_SERVER_URL']))
const AWS = require('aws-sdk')
const elasticsearch = require('elasticsearch')

// Elasticsearch client
let esClient

/**
 * Check the error is custom error.
 * @returns {Boolean} true if error is custom error, false otherwise
 */
function isCustomError (err) {
  return _.keys(errors).includes(err.name)
}

/**
 * Send Kafka event message
 * @params {String} topic the topic name
 * @params {Object} payload the payload
 */
async function postEvent (topic, payload) {
  logger.info(`Publish event to Kafka topic ${topic}`)
  const message = {
    topic,
    originator: config.KAFKA_MESSAGE_ORIGINATOR,
    timestamp: new Date().toISOString(),
    'mime-type': 'application/json',
    payload
  }
  await busApiClient.postEvent(message)
}

/**
 * Wrap async function to standard express function
 * @param {Function} fn the async function
 * @returns {Function} the wrapped function
 */
function wrapExpress (fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next)
  }
}

/**
 * Wrap all functions from object
 * @param obj the object (controller exports)
 * @returns {Object|Array} the wrapped object
 */
function autoWrapExpress (obj) {
  if (_.isArray(obj)) {
    return obj.map(autoWrapExpress)
  }
  if (_.isFunction(obj)) {
    if (obj.constructor.name === 'AsyncFunction') {
      return wrapExpress(obj)
    }
    return obj
  }
  _.each(obj, (value, key) => {
    obj[key] = autoWrapExpress(value)
  })
  return obj
}

/**
 * Check if the user has admin role
 * @param {Object} authUser the user
 */
function hasAdminRole (authUser) {
  for (let i = 0; i < authUser.roles.length; i++) {
    if (authUser.roles[i].toLowerCase() === constants.UserRoles.Admin.toLowerCase()) {
      return true
    }
  }
  return false
}

/**
 * Check if exists.
 *
 * @param {Array} source the array in which to search for the term
 * @param {Array | String} term the term to search
 */
function checkIfExists (source, term) {
  let terms

  if (!_.isArray(source)) {
    throw new Error('Source argument should be an array')
  }

  source = source.map(s => s.toLowerCase())

  if (_.isString(term)) {
    terms = term.split(' ')
  } else if (_.isArray(term)) {
    terms = term.map(t => t.toLowerCase())
  } else {
    throw new Error('Term argument should be either a string or an array')
  }

  for (let i = 0; i < terms.length; i++) {
    if (source.includes(terms[i])) {
      return true
    }
  }

  return false
}

/**
 * Get Data by model id
 * @param {Object} modelName The dynamoose model name
 * @param {String} id The id value
 * @returns {Promise<void>}
 */
async function getById (modelName, id) {
  return new Promise((resolve, reject) => {
    models[modelName].query('id').eq(id).exec((err, result) => {
      if (err) {
        return reject(err)
      }
      if (result.length > 0) {
        return resolve(result[0])
      } else {
        return reject(new errors.NotFoundError(`${modelName} with id: ${id} doesn't exist`))
      }
    })
  })
}

/**
 * Create item in database
 * @param {Object} modelName The dynamoose model name
 * @param {Object} data The create data object
 * @returns {Promise<void>}
 */
async function create (modelName, data) {
  return new Promise((resolve, reject) => {
    const dbItem = new models[modelName](data)
    dbItem.save((err) => {
      if (err) {
        return reject(err)
      }

      return resolve(dbItem)
    })
  })
}

/**
 * Update item in database
 * @param {Object} dbItem The Dynamo database item
 * @param {Object} data The updated data object
 * @returns {Promise<void>}
 */
async function update (dbItem, data) {
  Object.keys(data).forEach((key) => {
    dbItem[key] = data[key]
  })
  return new Promise((resolve, reject) => {
    dbItem.save((err) => {
      if (err) {
        return reject(err)
      }

      return resolve(dbItem)
    })
  })
}

/**
 * Get data collection by scan parameters
 * @param {Object} modelName The dynamoose model name
 * @param {Object} scanParams The scan parameters object
 * @returns {Promise<void>}
 */
async function scan (modelName, scanParams) {
  return new Promise((resolve, reject) => {
    models[modelName].scan(scanParams).exec((err, result) => {
      if (err) {
        return reject(err)
      }

      return resolve(result.count === 0 ? [] : result)
    })
  })
}

/**
 * Get data collection by query parameters
 * @param {Object} modelName The dynamoose model name
 * @param {Object} queryParams The query parameters object
 * @returns {Promise<void>}
 */
async function query (modelName, queryParams) {
  return new Promise((resolve, reject) => {
    models[modelName].query(queryParams).exec((err, result) => {
      if (err) {
        return reject(err)
      }

      return resolve(result.count === 0 ? [] : result)
    })
  })
}

/**
 * Check duplication of specified model
 * @param {Object} modelName The dynamoose model name
 * @param {Object} queryParams The query parameters object
 * @param {String} errorMessage the error message if duplication exist.
 * @returns {Boolean} true if duplication exist, false otherwise.
 */
async function validateDuplicate (modelName, queryParams, errorMessage) {
  const list = await query(modelName, queryParams)
  if (list.length > 0) {
    throw new errors.ConflictError(errorMessage)
  }
}

/**
 * Uses superagent to proxy get request
 * @param {String} url the url
 * @returns {Object} the response
 */
async function getRequest (url) {
  const m2mToken = await m2m.getMachineToken(config.AUTH0_CLIENT_ID, config.AUTH0_CLIENT_SECRET)

  return request
    .get(url)
    .set('Authorization', `Bearer ${m2mToken}`)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
}

/**
 * Get ES Client
 * @return {Object} Elasticsearch Client Instance
 */
function getESClient () {
  if (esClient) {
    return esClient
  }
  const hosts = config.ES.HOST
  const apiVersion = config.ES.API_VERSION
  // AWS ES configuration is different from other providers
  if (/.*amazonaws.*/.test(hosts)) {
    esClient = elasticsearch.Client({
      apiVersion,
      hosts,
      connectionClass: require('http-aws-es'), // eslint-disable-line global-require
      amazonES: {
        region: config.ES.AWS_REGION,
        credentials: new AWS.EnvironmentCredentials('AWS')
      }
    })
  } else {
    esClient = new elasticsearch.Client({
      apiVersion,
      hosts
    })
  }
  return esClient
}

/**
 * Create Elasticsearch index, it will be deleted and re-created if present.
 * @param {String} indexName the ES index name
 */
async function createESIndex (indexName) {
  const client = getESClient()
  // delete index if present
  try {
    await client.indices.delete({ index: indexName })
  } catch (err) {
    // ignore
  }
  // create index
  const body = {}
  if (indexName === config.ES.RESOURCE_ROLE_INDEX) {
    body.mappings = {
      _doc: {
        properties: {
          isActive: {
            type: 'keyword'
          },
          name: {
            type: 'keyword'
          }
        }
      }
    }
  } else if (indexName === config.ES.RESOURCE_INDEX) {
    body.mappings = {
      _doc: {
        properties: {
          challengeId: {
            type: 'keyword'
          },
          memberId: {
            type: 'keyword'
          },
          roleId: {
            type: 'keyword'
          }
        }
      }
    }
  }
  await client.indices.create({ index: indexName, body })
}

/**
 * Get resource roles by given criteria (may include isActive filter) from Elasticsearch.
 * @param {Object} criteria the search criteria
 * @returns {Array} the searched resource roles
 */
async function getResourceRolesFromES (criteria) {
  const client = getESClient()

  // construct ES query
  const esQuery = {
    index: config.ES.RESOURCE_ROLE_INDEX,
    type: config.ES.RESOURCE_ROLE_TYPE,
    size: constants.MAX_ES_SEARCH_SIZE, // use a large size to query all matched records
    body: {
      sort: [{ name: { order: 'asc' } }]
    }
  }
  if (!_.isNil(criteria.isActive)) {
    esQuery.body.query = {
      bool: {
        filter: [{ term: { isActive: criteria.isActive } }]
      }
    }
  }

  // Search with constructed query
  const docs = await client.search(esQuery)
  return _.map(docs.hits.hits, (item) => item._source)
}

module.exports = {
  wrapExpress,
  autoWrapExpress,
  checkIfExists,
  hasAdminRole,
  getById,
  create,
  update,
  query,
  scan,
  validateDuplicate,
  getRequest,
  postEvent,
  isCustomError,
  getESClient,
  createESIndex,
  getResourceRolesFromES
}
