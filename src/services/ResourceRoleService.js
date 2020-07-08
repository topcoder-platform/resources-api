/**
 * This service provides operations of resource roles.
 */

const _ = require('lodash')
const config = require('config')
const Joi = require('joi')
const uuid = require('uuid/v4')
const helper = require('../common/helper')
// const logger = require('../common/logger')

const payloadFields = ['id', 'name', 'legacyId', 'fullAccess', 'isActive', 'selfObtainable']

/**
 * Get resource roles.
 * @param {Object} criteria the search criteria
 * @returns {Array} the search result
 */
async function getResourceRoles (criteria) {
  let records = await helper.scan('ResourceRole')
  if (criteria.name) records = _.filter(records, e => (criteria.name === e.name))
  if (criteria.id) records = _.filter(records, e => (criteria.id === e.id))
  if (!_.isUndefined(criteria.isActive)) records = _.filter(records, e => (e.isActive === (criteria.isActive === 'true')))
  if (!_.isUndefined(criteria.selfObtainable)) records = _.filter(records, e => (e.selfObtainable === (criteria.selfObtainable === 'true')))
  if (!_.isUndefined(criteria.fullAccess)) records = _.filter(records, e => (e.fullAccess === (criteria.fullAccess === 'true')))

  return _.map(records, e => _.pick(e, payloadFields))
}

getResourceRoles.schema = {
  criteria: Joi.object().keys({
    isActive: Joi.boolean(),
    selfObtainable: Joi.boolean(),
    fullAccess: Joi.boolean(),
    id: Joi.id(),
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
    const nameLower = resourceRole.name.toLowerCase()
    await helper.validateDuplicate('ResourceRole', { nameLower },
      `ResourceRole with name: ${resourceRole.name} already exist.`)
    const entity = await helper.create('ResourceRole', _.assign({ id: uuid(), nameLower }, resourceRole))
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
  resourceRole: Joi.object().keys({
    name: Joi.string().required(),
    fullAccess: Joi.boolean().required(),
    isActive: Joi.boolean().required(),
    selfObtainable: Joi.boolean().required()
  }).required()
}

/**
 * Update resource role.
 * @param {String} resourceRoleId the resource role id
 * @param {Object} data the resource role data to be updated
 * @returns {Object} the updated resource role
 */
async function updateResourceRole (resourceRoleId, data) {
  try {
    const resourceRole = await helper.getById('ResourceRole', resourceRoleId)
    data.nameLower = data.name.toLowerCase()
    if (resourceRole.nameLower !== data.nameLower) {
      await helper.validateDuplicate('ResourceRole', { nameLower: data.nameLower },
        `ResourceRole with name: ${data.name} already exist.`)
    }
    const entity = await helper.update(resourceRole, data)
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
  createResourceRole,
  updateResourceRole
}

// logger.buildService(module.exports)
