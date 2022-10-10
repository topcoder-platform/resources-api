/**
 * This service provides operations to clean up the environment for running automated tests.
 */

const _ = require("lodash");
const config = require("config");
const models = require("../model/index");
const helper = require("../common/helper");
const logger = require("../common/logger");

/**
 * Delete the Resource from the ES by the given id
 * @param id the resource id
 * @returns {Promise<void>}
 */
const deleteFromESById = async (id) => {
  // delete from ES
  const esClient = await helper.getESClient();
  await esClient.delete({
    index: config.ES.ES_INDEX,
    type: config.ES.ES_TYPE,
    id: id,
    refresh: "true", // refresh ES so that it is effective for read operations instantly
  });
};

/**
 * Get Data by model id.
 * @param {Object} modelName The dynamoose model name
 * @param {String} id The id value
 * @returns {Promise<void>}
 */
const getById = async (modelName, id) => {
  return new Promise((resolve, reject) => {
    models[modelName]
      .query("id")
      .eq(id)
      .exec((err, result) => {
        if (err) {
          logger.info("ERROR");
          return reject(err);
        }
        if (result.length > 0) {
          return resolve(result[0]);
        } else {
          return resolve(null);
        }
      });
  });
};

/**
 * Delete the record from database by the given id.
 * @param modelName the model name
 * @param id the id
 * @returns {Promise<void>}
 */
const deleteFromDBById = async (modelName, id) => {
  if (id && id.length > 0) {
    try {
      const entity = await getById(modelName, id);
      if (entity) {
        await entity.delete();
      }
    } catch (err) {
      throw err;
    }
  }
};

/**
 * Clear the postman test data. The main function of this class.
 * @returns {Promise<void>}
 */
const cleanUpTestData = async () => {
  logger.info("clear the test data from postman test!");
  let roles = await helper.scanAll("ResourceRole");
  roles = _.filter(roles, (r) =>
    r.name.startsWith(config.AUTOMATED_TESTING_NAME_PREFIX)
  );
  for (const role of roles) {
    let roleId = role.id;
    let rolePhaseDeps = await helper.scanAll("ResourceRolePhaseDependency");
    rolePhaseDeps = _.filter(rolePhaseDeps, (d) => d.resourceRoleId === roleId);
    for (const dep of rolePhaseDeps) {
      logger.info("ResourceRolePhaseDependency to be deleted", dep.id);
      await deleteFromDBById("ResourceRolePhaseDependency", dep.id);
    }
    let resources = await helper.scanAll("Resource");
    resources = _.filter(resources, (r) => r.roleId === roleId);
    for (const res of resources) {
      logger.info("Resource to be deleted", res.id);
      await deleteFromDBById("Resource", res.id);
      await deleteFromESById(res.id);
    }
    logger.info("ResourceRole to be deleted", roleId);
    await deleteFromDBById("ResourceRole", roleId);
  }
  logger.info("clear the test data from postman test completed!");
};

module.exports = {
  cleanUpTestData,
};

logger.buildService(module.exports);
