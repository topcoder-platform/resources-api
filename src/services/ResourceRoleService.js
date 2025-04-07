/**
 * This service provides operations of resource roles.
 */

const _ = require('lodash')
const config = require('config')
const Joi = require('joi')
const { v4: uuid } = require('uuid')
const moment = require('moment')
const helper = require('../common/helper')
const logger = require('../common/logger')
const prisma = require('../common/prisma').getClient()

const payloadFields = ['id', 'name', 'legacyId', 'fullReadAccess', 'fullWriteAccess', 'isActive', 'selfObtainable']

/**
 * Get resource roles.
 * @param {Object} criteria the search criteria
 * @returns {Array} the search result
 */
async function getResourceRoles (criteria) {
  const prismaFilter = { where: { AND: [] } }
  if (criteria.name) {
    prismaFilter.where.AND.push({ name: criteria.name })
  }
  if (criteria.id) {
    prismaFilter.where.AND.push({ id: criteria.id })
  }
  if (criteria.legacyId) {
    prismaFilter.where.AND.push({ legacyId: _.toNumber(criteria.legacyId) })
  }
  if (!_.isUndefined(criteria.isActive)) {
    prismaFilter.where.AND.push({ isActive: criteria.isActive })
  }
  if (!_.isUndefined(criteria.selfObtainable)) {
    prismaFilter.where.AND.push({ selfObtainable: criteria.selfObtainable })
  }
  if (!_.isUndefined(criteria.fullReadAccess)) {
    prismaFilter.where.AND.push({ fullReadAccess: criteria.fullReadAccess })
  }
  if (!_.isUndefined(criteria.fullWriteAccess)) {
    prismaFilter.where.AND.push({ fullWriteAccess: criteria.fullWriteAccess })
  }
  let records = await prisma.resourceRole.findMany(prismaFilter)

  const result = _.map(records, e => _.pick(e, payloadFields))
  return {
    data: result,
    total: result.length,
    page: 1,
    perPage: Math.max(10, result.length)
  }
}

getResourceRoles.schema = {
  criteria: Joi.object().keys({
    isActive: Joi.boolean(),
    selfObtainable: Joi.boolean(),
    fullReadAccess: Joi.boolean(),
    fullWriteAccess: Joi.boolean(),
    id: Joi.optionalId(),
    legacyId: Joi.number(),
    name: Joi.string()
  }).required()
}

/**
 * Create resource role.
 * @param {Object} authUser request auth user
 * @param {Object} setting the challenge setting to created
 * @returns {Object} the created challenge setting
 */
async function createResourceRole (authUser, resourceRole) {
  try {
    const nameLower = resourceRole.name.toLowerCase()
    await helper.validateDuplicate('ResourceRole', { nameLower },
      `ResourceRole with name: ${resourceRole.name} already exist.`)
    const entity = await prisma.resourceRole.create({
      data: _.assign({ id: uuid(),
        nameLower,
        createdAt: moment().utc().format(),
        createdBy: helper.getUserHandleOrSub(authUser) }, resourceRole)
    })
    const ret = _.pick(entity, payloadFields)
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
  authUser: Joi.any(),
  resourceRole: Joi.object().keys({
    name: Joi.string().required(),
    fullReadAccess: Joi.boolean().required(),
    fullWriteAccess: Joi.boolean().required(),
    isActive: Joi.boolean().required(),
    selfObtainable: Joi.boolean().required()
  }).required()
}

/**
 * Update resource role.
 * @param {Object} authUser request auth user
 * @param {String} resourceRoleId the resource role id
 * @param {Object} data the resource role data to be updated
 * @returns {Object} the updated resource role
 */
async function updateResourceRole (authUser, resourceRoleId, data) {
  try {
    const resourceRole = await helper.getById('ResourceRole', resourceRoleId)
    data.nameLower = data.name.toLowerCase()
    if (resourceRole.nameLower !== data.nameLower) {
      await helper.validateDuplicate('ResourceRole', { nameLower: data.nameLower },
        `ResourceRole with name: ${data.name} already exist.`)
    }
    const entity = await helper.update(authUser, 'ResourceRole', resourceRole, data)
    const ret = _.pick(entity, payloadFields)
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
  authUser: Joi.any(),
  resourceRoleId: Joi.id(),
  data: Joi.object().keys({
    name: Joi.string().required(),
    fullReadAccess: Joi.boolean().required(),
    fullWriteAccess: Joi.boolean().required(),
    isActive: Joi.boolean().required(),
    selfObtainable: Joi.boolean().required()
  }).required()
}

module.exports = {
  getResourceRoles,
  createResourceRole,
  updateResourceRole
}

logger.buildService(module.exports)
