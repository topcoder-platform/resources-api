/**
 * This service provides operations of resource roles.
 */

const _ = require("lodash");
const config = require("config");
const Joi = require("joi");
const { v4: uuid } = require("uuid");
const helper = require("../common/helper");
const logger = require("../common/logger");
const { resourceRoleDomain } = require("../domain/resource/ResourceRoleDomain");
const { Operator } = require("../models/resource/common/Common");
const { default: domainHelper } = require("../common/domain-helper");
const errors = require("../common/errors");

const payloadFields = [
  "id",
  "name",
  "legacyId",
  "fullReadAccess",
  "fullWriteAccess",
  "isActive",
  "selfObtainable",
];

/**
 * Get resource roles.
 * @param {Object} criteria the search criteria
 * @returns {Array} the search result
 */
async function getResourceRoles(criteria) {
  const { items } = await resourceRoleDomain.scan({
    scanCriteria: domainHelper.getScanCriteria(criteria),
  });

  return {
    data: items,
    total: items.length,
    page: 1,
    perPage: Math.max(10, items.length),
  };
}

getResourceRoles.schema = {
  criteria: Joi.object()
    .keys({
      isActive: Joi.boolean(),
      selfObtainable: Joi.boolean(),
      fullReadAccess: Joi.boolean(),
      fullWriteAccess: Joi.boolean(),
      id: Joi.optionalId(),
      legacyId: Joi.number(),
      name: Joi.string(),
    })
    .required(),
};

/**
 * Create resource role.
 * @param {Object} setting the challenge setting to created
 * @returns {Object} the created challenge setting
 */
async function createResourceRole(resourceRole) {
  try {
    const resourcesMatchingName = await resourceRoleDomain.scan({
      scanCriteria: domainHelper.getScanCriteria({
        nameLower: resourceRole.name.toLowerCase(),
      }),
    });

    if (resourcesMatchingName.items.length > 0) {
      throw new errors.ConflictError(
        `ResourceRole with name: ${resourceRole.name} already exist.`
      );
    }

    const newResourceRole = await resourceRoleDomain.create(resourceRole);

    await helper.postEvent(config.RESOURCE_ROLE_CREATE_TOPIC, ret);

    return newResourceRole;
  } catch (err) {
    if (!helper.isCustomError(err)) {
      await helper.postEvent(config.KAFKA_ERROR_TOPIC, {
        error: _.pick(err, "name", "message", "stack"),
      });
    }
    throw err;
  }
}

createResourceRole.schema = {
  resourceRole: Joi.object()
    .keys({
      name: Joi.string().required(),
      fullReadAccess: Joi.boolean(),
      fullWriteAccess: Joi.boolean(),
      isActive: Joi.boolean().required(),
      selfObtainable: Joi.boolean().required(),
    })
    .required(),
};

/**
 * Update resource role.
 * @param {String} resourceRoleId the resource role id
 * @param {Object} data the resource role data to be updated
 * @returns {Object} the updated resource role
 */
async function updateResourceRole(resourceRoleId, data) {
  try {
    const resourceRole = await helper.getById("ResourceRole", resourceRoleId);
    data.nameLower = data.name.toLowerCase();
    if (resourceRole.nameLower !== data.nameLower) {
      await helper.validateDuplicate(
        "ResourceRole",
        { nameLower: data.nameLower },
        `ResourceRole with name: ${data.name} already exist.`
      );
    }
    const entity = await helper.update(resourceRole, data);
    const ret = _.pick(entity, payloadFields);
    await helper.postEvent(config.RESOURCE_ROLE_UPDATE_TOPIC, ret);
    return ret;
  } catch (err) {
    if (!helper.isCustomError(err)) {
      await helper.postEvent(config.KAFKA_ERROR_TOPIC, {
        error: _.pick(err, "name", "message", "stack"),
      });
    }
    throw err;
  }
}

updateResourceRole.schema = {
  resourceRoleId: Joi.id(),
  data: Joi.object()
    .keys({
      name: Joi.string().required(),
      fullReadAccess: Joi.boolean(),
      fullWriteAccess: Joi.boolean(),
      isActive: Joi.boolean().required(),
      selfObtainable: Joi.boolean().required(),
    })
    .required(),
};

module.exports = {
  getResourceRoles,
  createResourceRole,
  updateResourceRole,
};

logger.buildService(module.exports);
