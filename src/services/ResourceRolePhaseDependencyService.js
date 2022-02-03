/**
 * This service provides operations of resource role phase dependencies.
 */

const _ = require('lodash')
const config = require('config')
const Joi = require('joi')
const { v4: uuid } = require('uuid')
const helper = require('../common/helper')
const logger = require('../common/logger')
const errors = require('../common/errors')

/**
 * Get dependencies.
 * @param {Object} criteria the search criteria
 * @returns {Array} the search result
 */
async function getDependencies (criteria) {
  const options = {}
  if (criteria.phaseId) {
    options.phaseId = { eq: criteria.phaseId }
  }
  if (criteria.resourceRoleId) {
    options.resourceRoleId = { eq: criteria.resourceRoleId }
  }
  if (!_.isNil(criteria.phaseState)) {
    options.phaseState = { eq: criteria.phaseState === 'true' }
  }
  const list = await helper.scanAll('ResourceRolePhaseDependency', options)
  return {
    data: list,
    total: list.length,
    page: 1,
    perPage: Math.max(10, list.length)
  }
}

getDependencies.schema = {
  criteria: Joi.object().keys({
    phaseId: Joi.optionalId(),
    resourceRoleId: Joi.optionalId(),
    phaseState: Joi.boolean()
  })
}

/**
 * Validate dependency.
 * @param {Object} data the data to validate
 */
async function validateDependency (data) {
  // validate phaseId
  const phases = await helper.getAllPages(config.CHALLENGE_PHASES_API_URL)
  if (!_.find(phases, (p) => p.id === data.phaseId)) {
    throw new errors.NotFoundError(`Not found phase id: ${data.phaseId}`)
  }

  // validate resourceRoleId
  const resourceRole = await helper.getById('ResourceRole', data.resourceRoleId)
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
    const entity = await helper.create('ResourceRolePhaseDependency', _.assign({ id: uuid() }, data))
    return entity
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
    const dependency = await helper.getById('ResourceRolePhaseDependency', id)
    if (dependency.phaseId !== data.phaseId || dependency.resourceRoleId !== data.resourceRoleId) {
      // check duplicate
      const records = await getDependencies({ phaseId: data.phaseId, resourceRoleId: data.resourceRoleId })
      if (records.length > 0) {
        throw new errors.ConflictError('There is already dependency of given phaseId and resourceRoleId')
      }
    }
    // update
    const entity = await helper.update(dependency, data)
    return entity
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
    const dependency = await helper.getById('ResourceRolePhaseDependency', id)
    await dependency.delete()
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
  deleteDependency
}

logger.buildService(module.exports)
