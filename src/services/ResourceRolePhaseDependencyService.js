/**
 * This service provides operations of resource role phase dependencies.
 */

const _ = require('lodash')
const config = require('config')
const Joi = require('joi')
const { v4: uuid } = require('uuid')
const moment = require('moment')
const helper = require('../common/helper')
const logger = require('../common/logger')
const errors = require('../common/errors')
const prisma = require('../common/prisma').getClient()

const auditFields = ['createdAt', 'createdBy', 'updatedAt', 'updatedBy']

/**
 * Get dependencies.
 * @param {Object} criteria the search criteria
 * @returns {Array} the search result
 */
async function getDependencies (criteria) {
  const prismaFilter = { where: { AND: [] } }
  if (criteria.phaseId) {
    prismaFilter.where.AND.push({ phaseId: criteria.phaseId })
  }
  if (criteria.resourceRoleId) {
    prismaFilter.where.AND.push({ resourceRoleId: criteria.resourceRoleId })
  }
  if (!_.isNil(criteria.phaseState)) {
    prismaFilter.where.AND.push({ phaseState: criteria.phaseState })
  }
  let list = await prisma.resourceRolePhaseDependency.findMany(prismaFilter)
  list = _.map(list, p => _.omit(p, auditFields))
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
 * @param {Object} authUser request auth user
 * @param {Object} data the data to create dependency
 * @returns {Object} the created dependency
 */
async function createDependency (authUser, data) {
  try {
    await validateDependency(data)
    // check duplicate
    const records = await getDependencies({ phaseId: data.phaseId, resourceRoleId: data.resourceRoleId })
    if (records.total > 0) {
      throw new errors.ConflictError('There is already dependency of given phaseId and resourceRoleId')
    }
    // create
    let entity = await prisma.resourceRolePhaseDependency.create({
      data: _.assign({
        id: uuid(),
        createdBy: helper.getUserHandleOrSub(authUser),
        createdAt: moment().utc().format()
      }, data)
    })
    entity = _.omit(entity, auditFields)
    return entity
  } catch (err) {
    if (!helper.isCustomError(err)) {
      await helper.postEvent(config.KAFKA_ERROR_TOPIC, { error: _.pick(err, 'name', 'message', 'stack') })
    }
    throw err
  }
}

createDependency.schema = {
  authUser: Joi.any(),
  data: Joi.object().keys({
    phaseId: Joi.id(),
    resourceRoleId: Joi.id(),
    phaseState: Joi.boolean().required()
  }).required()
}

/**
 * Update dependency.
 * @param {Object} authUser request auth user
 * @param {String} id the dependency id
 * @param {Object} data the data to be update
 * @returns {Object} the updated dependency
 */
async function updateDependency (authUser, id, data) {
  try {
    await validateDependency(data)
    const dependency = await helper.getById('ResourceRolePhaseDependency', id)
    if (dependency.phaseId !== data.phaseId || dependency.resourceRoleId !== data.resourceRoleId) {
      // check duplicate
      const records = await getDependencies({ phaseId: data.phaseId, resourceRoleId: data.resourceRoleId })
      if (records.total > 0) {
        throw new errors.ConflictError('There is already dependency of given phaseId and resourceRoleId')
      }
    }
    // update
    let entity = await helper.update(authUser, 'ResourceRolePhaseDependency', dependency, data)
    entity = _.omit(entity, auditFields)
    return entity
  } catch (err) {
    if (!helper.isCustomError(err)) {
      await helper.postEvent(config.KAFKA_ERROR_TOPIC, { error: _.pick(err, 'name', 'message', 'stack') })
    }
    throw err
  }
}

updateDependency.schema = {
  authUser: Joi.any(),
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
    let dependency = await helper.getById('ResourceRolePhaseDependency', id)
    dependency = _.omit(dependency, auditFields)
    await prisma.resourceRolePhaseDependency.deleteMany({ where: { id } })
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
