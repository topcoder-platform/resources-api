/**
 * This service provides operations of resource roles.
 */

const _ = require('lodash')
const config = require('config')
const Joi = require('joi')
const uuid = require('uuid/v4')
const helper = require('../common/helper')
const logger = require('../common/logger')
const errors = require('../common/errors')

const esClient = helper.getESClient()

const payloadFields = ['id', 'name', 'fullAccess', 'isActive', 'selfObtainable']

/**
 * Get resource roles.
 * @param {Object} criteria the search criteria
 * @returns {Array} the search result
 */
async function getResourceRoles (criteria) {
  const mustQuery = []
  const boolQuery = []

  if (criteria.isActive) {
    boolQuery.push({ match: { isActive: criteria.isActive } })
  }
  if (criteria.name) {
    boolQuery.push({ match: { name: `.*${criteria.name}.*` } })
  }

  if (boolQuery.length > 0) {
    mustQuery.push({
      bool: {
        filter: boolQuery
      }
    })
  }

  const esQuery = {
    index: config.get('ES.RESOURCE_ROLES_ES_INDEX'),
    body: {
      query: mustQuery.length > 0 ? {
        bool: {
          must: mustQuery
        }
      } : {
        match_all: {}
      }
    }
  }

  // Search with constructed query
  let docs
  try {
    docs = await esClient.search(esQuery)
  } catch (e) {
    // Catch error when the ES is fresh and has no data
    docs = {
      hits: {
        total: 0,
        hits: []
      }
    }
  }

  // Extract data from hits
  let result = _.map(docs.hits.hits, item => _.pick(item._source, payloadFields))

  return result
}

getResourceRoles.schema = {
  criteria: Joi.object().keys({
    isActive: Joi.boolean(),
    name: Joi.string()
  }).required()
}

/**
 * Create resource role.
 * @param {Object} setting the challenge setting to created
 * @returns {Object} the created challenge setting
 */
async function createResourceRole (resourceRole) {
  try {
    const [duplicate] = await getResourceRoles({ name: resourceRole.name })
    if (duplicate) {
      throw new errors.ConflictError(`Resource role with name: ${resourceRole.name} already exists`)
    }
    const nameLower = resourceRole.name.toLowerCase()

    resourceRole = _.assign({ id: uuid(), nameLower }, resourceRole)

    await esClient.create({
      index: config.get('ES.RESOURCE_ROLES_ES_INDEX'),
      type: config.get('ES.RESOURCE_ROLES_ES_TYPE'),
      refresh: config.get('ES.ES_REFRESH'),
      id: resourceRole.id,
      body: resourceRole
    })

    const ret = _.pick(resourceRole, payloadFields)
    await helper.postEvent(config.RESOURCE_ROLE_CREATE_TOPIC, ret)
    return ret
  } catch (err) {
    if (!helper.isCustomError(err)) {
      await helper.postEvent(config.KAFKA_ERROR_TOPIC, { error: _.pick(err, 'name', 'message', 'stack') })
    }
    throw err
  }
}

createResourceRole.schema = {
  resourceRole: Joi.object().keys({
    name: Joi.string().required(),
    fullAccess: Joi.boolean().required(),
    isActive: Joi.boolean().required(),
    selfObtainable: Joi.boolean().required()
  }).required()
}

/**
 * Get resource role.
 * @param {String} id the resource role id
 * @returns {Object} the resource role with given id
 */
async function getResourceRole (id) {
  return esClient.getSource({
    index: config.get('ES.RESOURCE_ROLES_ES_INDEX'),
    type: config.get('ES.RESOURCE_ROLES_ES_TYPE'),
    id
  })
}

getResourceRole.schema = {
  id: Joi.id()
}

/**
 * Update resource role.
 * @param {String} resourceRoleId the resource role id
 * @param {Object} data the resource role data to be updated
 * @returns {Object} the updated resource role
 */
async function updateResourceRole (resourceRoleId, data) {
  try {
    const resourceRole = await getResourceRole(resourceRoleId)
    data.nameLower = data.name.toLowerCase()
    if (resourceRole.nameLower !== data.nameLower) {
      const [duplicate] = await getResourceRoles({ name: resourceRole.name })
      if (duplicate) {
        throw new errors.ConflictError(`Resource role with name: ${resourceRole.name} already exists`)
      }
    }
    _.extend(resourceRole, data)

    await esClient.update({
      index: config.get('ES.RESOURCE_ROLES_ES_INDEX'),
      type: config.get('ES.RESOURCE_ROLES_ES_TYPE'),
      refresh: config.get('ES.ES_REFRESH'),
      id: resourceRoleId,
      body: {
        doc: resourceRole
      }
    })

    const ret = _.pick(resourceRole, payloadFields)
    await helper.postEvent(config.RESOURCE_ROLE_UPDATE_TOPIC, ret)
    return ret
  } catch (err) {
    if (!helper.isCustomError(err)) {
      await helper.postEvent(config.KAFKA_ERROR_TOPIC, { error: _.pick(err, 'name', 'message', 'stack') })
    }
    throw err
  }
}

updateResourceRole.schema = {
  resourceRoleId: Joi.id(),
  data: Joi.object().keys({
    name: Joi.string().required(),
    fullAccess: Joi.boolean().required(),
    isActive: Joi.boolean().required(),
    selfObtainable: Joi.boolean().required()
  }).required()
}

module.exports = {
  getResourceRoles,
  getResourceRole,
  createResourceRole,
  updateResourceRole
}

logger.buildService(module.exports)
