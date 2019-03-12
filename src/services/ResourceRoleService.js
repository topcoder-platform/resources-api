/**
 * This service provides operations of resource roles.
 */

const _ = require('lodash')
const Joi = require('joi')
const uuid = require('uuid/v4')
const helper = require('../common/helper')
const logger = require('../common/logger')

/**
 * Get resource roles.
 * @param {Object} criteria the search criteria
 * @returns {Object} the search result
 */
async function getResourceRoles (criteria) {
  const list = await helper.scan('ResourceRole')
  const records = _.filter(list, e => _.isUndefined(criteria.isActive) || criteria.isActive === e.isActive)
  return _.map(records, e => _.pick(e, ['id', 'name', 'fullAccess', 'isActive']))
}

getResourceRoles.schema = {
  criteria: Joi.object().keys({
    isActive: Joi.boolean()
  }).required()
}

/**
 * Create resource role.
 * @param {Object} setting the challenge setting to created
 * @returns {Object} the created challenge setting
 */
async function createResourceRole (resourceRole) {
  const nameLower = resourceRole.name.toLowerCase()
  await helper.validateDuplicate('ResourceRole', { nameLower },
    `ResourceRole with name: ${resourceRole.name} already exist.`)
  const ret = await helper.create('ResourceRole', _.assign({ id: uuid(), nameLower }, resourceRole))
  return _.pick(ret, ['id', 'name', 'fullAccess', 'isActive'])
}

createResourceRole.schema = {
  resourceRole: Joi.object().keys({
    name: Joi.string().required(),
    fullAccess: Joi.boolean().required(),
    isActive: Joi.boolean().required()
  }).required()
}

/**
 * Update resource role.
 * @param {String} resourceRoleId the resource role id
 * @param {Object} data the resource role data to be updated
 * @returns {Object} the updated resource role
 */
async function updateResourceRole (resourceRoleId, data) {
  const resourceRole = await helper.getById('ResourceRole', resourceRoleId)
  data.nameLower = data.name.toLowerCase()
  if (resourceRole.nameLower !== data.nameLower) {
    await helper.validateDuplicate('ResourceRole', { nameLower: data.nameLower },
      `ResourceRole with name: ${data.name} already exist.`)
  }
  const ret = await helper.update(resourceRole, data)
  return _.pick(ret, ['id', 'name', 'fullAccess', 'isActive'])
}

updateResourceRole.schema = {
  resourceRoleId: Joi.id(),
  data: Joi.object().keys({
    name: Joi.string().required(),
    fullAccess: Joi.boolean().required(),
    isActive: Joi.boolean().required()
  }).required()
}

module.exports = {
  getResourceRoles,
  createResourceRole,
  updateResourceRole
}

logger.buildService(module.exports)
