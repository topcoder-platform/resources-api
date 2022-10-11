/**
 * This service provides operations of resource role phase dependencies.
 */

const _ = require("lodash");
const config = require("config");
const Joi = require("joi");
const helper = require("../common/helper");
const logger = require("../common/logger");
const errors = require("../common/errors");

const { default: domainHelper } = require("../common/domain-helper");
const {
  resourceRolePhaseDependency,
} = require("../domain/resource/ResourceRolePhaseDependencyDomain");

const { getResourceRoles } = require("./ResourceRoleService");

/**
 * Get dependencies.
 * @param {Object} criteria the search criteria
 * @returns {Array} the search result
 */
async function getDependencies(criteria) {
  const { items } = await resourceRolePhaseDependency.scan({
    scanCriteria: domainHelper.getScanCriteria(criteria),
  });

  return {
    data: items,
    total: items.length,
    page: 1,
    perPage: Math.max(10, items.length),
  };
}

getDependencies.schema = {
  criteria: Joi.object().keys({
    phaseId: Joi.optionalId(),
    resourceRoleId: Joi.optionalId(),
    phaseState: Joi.boolean(),
  }),
};

/**
 * Validate dependency.
 * @param {Object} data the data to validate
 */
async function validateDependency(data) {
  // validate phaseId
  const phases = await helper.getAllPages(config.CHALLENGE_PHASES_API_URL);
  if (!_.find(phases, (p) => p.id === data.phaseId)) {
    throw new errors.NotFoundError(`Not found phase id: ${data.phaseId}`);
  }

  console.log("get id", data.resourceRoleId);

  const resourceRoles = (
    await getResourceRoles({
      id: data.resourceRoleId,
    })
  ).data;

  console.log("ResourceRoles", resourceRoles);

  if (resourceRoles.length == 0 || !resourceRoles[0].isActive) {
    throw new errors.BadRequestError(
      `Resource role with id: ${data.resourceRoleId} doesn't exist or is inactive`
    );
  }
}

/**
 * Create dependency.
 * @param {Object} data the data to create dependency
 * @returns {Object} the created dependency
 */
async function createDependency(data) {
  try {
    await validateDependency(data);
    // check duplicate
    const records = await getDependencies({
      phaseId: data.phaseId,
      resourceRoleId: data.resourceRoleId,
    });
    if (records.length > 0) {
      throw new errors.ConflictError(
        "There is already dependency of given phaseId and resourceRoleId"
      );
    }

    return resourceRolePhaseDependency.create(data);
  } catch (err) {
    if (!helper.isCustomError(err)) {
      await helper.postEvent(config.KAFKA_ERROR_TOPIC, {
        error: _.pick(err, "name", "message", "stack"),
      });
    }
    throw err;
  }
}

createDependency.schema = {
  data: Joi.object()
    .keys({
      phaseId: Joi.id(),
      resourceRoleId: Joi.id(),
      phaseState: Joi.boolean().required(),
    })
    .required(),
};

/**
 * Update dependency.
 * @param {String} id the dependency id
 * @param {Object} data the data to be update
 * @returns {Object} the updated dependency
 */
async function updateDependency(id, data) {
  try {
    await validateDependency(data);
    const dependency = await helper.getById("ResourceRolePhaseDependency", id);
    if (
      dependency.phaseId !== data.phaseId ||
      dependency.resourceRoleId !== data.resourceRoleId
    ) {
      // check duplicate
      const records = await getDependencies({
        phaseId: data.phaseId,
        resourceRoleId: data.resourceRoleId,
      });
      if (records.length > 0) {
        throw new errors.ConflictError(
          "There is already dependency of given phaseId and resourceRoleId"
        );
      }
    }
    // update
    const entity = await helper.update(dependency, data);
    return entity;
  } catch (err) {
    if (!helper.isCustomError(err)) {
      await helper.postEvent(config.KAFKA_ERROR_TOPIC, {
        error: _.pick(err, "name", "message", "stack"),
      });
    }
    throw err;
  }
}

updateDependency.schema = {
  id: Joi.id(),
  data: createDependency.schema.data,
};

/**
 * Delete dependency.
 * @param {String} id the dependency id
 * @returns {Object} the deleted dependency
 */
async function deleteDependency(id) {
  try {
    const { resourceRolePhaseDependencies } =
      await resourceRolePhaseDependency.delete({
        key: "id",
        value: {
          value: {
            $case: "stringValue",
            stringValue: id,
          },
        },
      });

    return resourceRolePhaseDependencies[0];
  } catch (err) {
    if (!helper.isCustomError(err)) {
      await helper.postEvent(config.KAFKA_ERROR_TOPIC, {
        error: _.pick(err, "name", "message", "stack"),
      });
    }
    throw err;
  }
}

deleteDependency.schema = {
  id: Joi.id(),
};

module.exports = {
  getDependencies,
  createDependency,
  updateDependency,
  deleteDependency,
};

logger.buildService(module.exports);
