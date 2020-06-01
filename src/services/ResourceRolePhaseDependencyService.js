/**
 * This service provides operations of resource role phase dependencies.
 */

const _ = require('lodash')
const config = require('config')
const Joi = require('joi')
const uuid = require('uuid/v4')
const helper = require('../common/helper')
const logger = require('../common/logger')
const errors = require('../common/errors')
const resourceRoleService = require('./ResourceRoleService')

const esClient = helper.getESClient()

/**
 * Get dependencies.
 * @param {Object} criteria the search criteria
 * @returns {Array} the search result
 */
async function getDependencies (criteria) {
  const mustQuery = []
  const boolQuery = []

  if (criteria.phaseId) {
    boolQuery.push({ match: { phaseId: criteria.phaseId } })
  }
  if (criteria.resourceRoleId) {
    boolQuery.push({ match: { resourceRoleId: criteria.resourceRoleId } })
  }
  if (criteria.phaseState) {
    boolQuery.push({ match: { phaseState: criteria.phaseState } })
  }

  if (boolQuery.length > 0) {
    mustQuery.push({
      bool: {
        filter: boolQuery
      }
    })
  }

  const esQuery = {
    index: config.get('ES.RESOURCE_ROLE_PHASE_DEPENDENCY_ES_INDEX'),
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
  let result = _.map(docs.hits.hits, item => item._source)

  return result
}

getDependencies.schema = {
  criteria: Joi.object().keys({
    phaseId: Joi.optionalId(),
    resourceRoleId: Joi.optionalId(),
    phaseState: Joi.boolean()
  })
}

/**
 * Get dependency.
 * @param {String} id the dependency id
 * @returns {Object} the dependency with given id
 */
async function getDependency (id) {
  return esClient.getSource({
    index: config.get('ES.RESOURCE_ROLE_PHASE_DEPENDENCY_ES_INDEX'),
    type: config.get('ES.RESOURCE_ROLE_PHASE_DEPENDENCY_ES_TYPE'),
    id
  })
}

getDependency.schema = {
  id: Joi.id()
}

/**
 * Validate dependency.
 * @param {Object} data the data to validate
 */
async function validateDependency (data) {
  // validate phaseId
  const phases = await getDependencies()
  if (!_.find(phases, (p) => p.id === data.phaseId)) {
    throw new errors.NotFoundError(`Not found phase id: ${data.phaseId}`)
  }

  // validate resourceRoleId
  const resourceRole = await resourceRoleService.getResourceRole(data.resourceRoleId)
  if (!resourceRole.isActive) {
    throw new errors.BadRequestError(`Resource role with id: ${data.resourceRoleId} is inactive`)
  }
}

/**
 * Create dependency.
 * @param {Object} data the data to create dependency
 * @returns {Object} the created dependency
 */
async function createDependency (data) {
  try {
    await validateDependency(data)
    // check duplicate
    const records = await getDependencies({ phaseId: data.phaseId, resourceRoleId: data.resourceRoleId })
    if (records.length > 0) {
      throw new errors.ConflictError('There is already dependency of given phaseId and resourceRoleId')
    }
    // create
    data = _.assign({ id: uuid() }, data)

    await esClient.create({
      index: config.get('ES.RESOURCE_ROLE_PHASE_DEPENDENCY_ES_INDEX'),
      type: config.get('ES.RESOURCE_ROLE_PHASE_DEPENDENCY_ES_TYPE'),
      refresh: config.get('ES.ES_REFRESH'),
      id: data.id,
      body: data
    })
    return data
  } catch (err) {
    if (!helper.isCustomError(err)) {
      await helper.postEvent(config.KAFKA_ERROR_TOPIC, { error: _.pick(err, 'name', 'message', 'stack') })
    }
    throw err
  }
}

createDependency.schema = {
  data: Joi.object().keys({
    phaseId: Joi.id(),
    resourceRoleId: Joi.id(),
    phaseState: Joi.boolean().required()
  }).required()
}

/**
 * Update dependency.
 * @param {String} id the dependency id
 * @param {Object} data the data to be update
 * @returns {Object} the updated dependency
 */
async function updateDependency (id, data) {
  try {
    await validateDependency(data)
    const dependency = await getDependency(id)
    if (dependency.phaseId !== data.phaseId || dependency.resourceRoleId !== data.resourceRoleId) {
      // check duplicate
      const records = await getDependencies({ phaseId: data.phaseId, resourceRoleId: data.resourceRoleId })
      if (records.length > 0) {
        throw new errors.ConflictError('There is already dependency of given phaseId and resourceRoleId')
      }
    }
    // update
    _.extend(dependency, data)

    await esClient.update({
      index: config.get('ES.RESOURCE_ROLE_PHASE_DEPENDENCY_ES_INDEX'),
      type: config.get('ES.RESOURCE_ROLE_PHASE_DEPENDENCY_ES_TYPE'),
      refresh: config.get('ES.ES_REFRESH'),
      id,
      body: {
        doc: dependency
      }
    })
    return dependency
  } catch (err) {
    if (!helper.isCustomError(err)) {
      await helper.postEvent(config.KAFKA_ERROR_TOPIC, { error: _.pick(err, 'name', 'message', 'stack') })
    }
    throw err
  }
}

updateDependency.schema = {
  id: Joi.id(),
  data: createDependency.schema.data
}

/**
 * Delete dependency.
 * @param {String} id the dependency id
 * @returns {Object} the deleted dependency
 */
async function deleteDependency (id) {
  try {
    const dependency = await getDependency(id)
    await esClient.delete({
      index: config.get('ES.RESOURCE_ROLE_PHASE_DEPENDENCY_ES_INDEX'),
      type: config.get('ES.RESOURCE_ROLE_PHASE_DEPENDENCY_ES_TYPE'),
      id
    })
    return dependency
  } catch (err) {
    if (!helper.isCustomError(err)) {
      await helper.postEvent(config.KAFKA_ERROR_TOPIC, { error: _.pick(err, 'name', 'message', 'stack') })
    }
    throw err
  }
}

deleteDependency.schema = {
  id: Joi.id()
}

module.exports = {
  getDependencies,
  createDependency,
  updateDependency,
  deleteDependency,
  getDependency
}

logger.buildService(module.exports)
