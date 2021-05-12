/**
 * Clear the postman test data. All data created by postman e2e tests will be cleared.
 */

const models = require('../../src/models')
const logger = require('../../src/common/logger')
const helper = require('../../src/common/helper')
const config = require('config')
const _ = require('lodash')

logger.info('Clear the Postman test data.')

/**
 * Delete the Resource from the ES by the given id
 * @param id the resource id
 * @returns {Promise<void>}
 */
const deleteFromESById = async (id) => {
  // delete from ES
  const esClient = await helper.getESClient()
  await esClient.delete({
    index: config.ES.ES_INDEX,
    type: config.ES.ES_TYPE,
    id: id,
    refresh: 'true' // refresh ES so that it is effective for read operations instantly
  })
}

/**
 * Get Data by model id.
 * @param {Object} modelName The dynamoose model name
 * @param {String} id The id value
 * @returns {Promise<void>}
 */
const getById = async (modelName, id) => {
  return new Promise((resolve, reject) => {
    models[modelName].query('id').eq(id).exec((err, result) => {
      if (err) {
        console.log('ERROR')
        return reject(err)
      }
      if (result.length > 0) {
        return resolve(result[0])
      } else {
        return resolve(null)
      }
    })
  })
}

/**
 * Delete the record from database by the given id.
 * @param modelName the model name
 * @param id the id
 * @returns {Promise<void>}
 */
const deleteFromDBById = async (modelName, id) => {
  if (id && id.length > 0) {
    try {
      const entity = await getById(modelName, id)
      if (entity) {
        await entity.delete()
      }
    } catch (err) {
      throw err
    }
  }
}

/**
 * Clear the postman test data. The main function of this class.
 * @returns {Promise<void>}
 */
const clearTestData = async () => {
  console.log('clear the test data from postman test!')
  let roles = await helper.scanAll('ResourceRole')
  roles = _.filter(roles, r => (r.name.startsWith(config.POSTMAN_ROLE_NAME_PREFIX)))
  for (const role of roles) {
    let roleId = role.id
    let rolePhaseDeps = await helper.scanAll('ResourceRolePhaseDependency')
    rolePhaseDeps = _.filter(rolePhaseDeps, d => (d.resourceRoleId === roleId))
    for (const dep of rolePhaseDeps) {
      console.log('ResourceRolePhaseDependency to be deleted', dep.id)
      await deleteFromDBById('ResourceRolePhaseDependency', dep.id)
    }
    let resources = await helper.scanAll('Resource')
    resources = _.filter(resources, r => (r.roleId === roleId))
    for (const res of resources) {
      console.log('Resource to be deleted', res.id)
      await deleteFromDBById('Resource', res.id)
      await deleteFromESById(res.id)
    }
    console.log('ResourceRole to be deleted', roleId)
    await deleteFromDBById('ResourceRole', roleId)
  }
  console.log('clear the test data from postman test completed!')
}

clearTestData().then(() => {
  logger.info('Done!')
  process.exit()
}).catch((e) => {
  logger.logFullError(e)
  process.exit(1)
})

module.exports = {
  clearTestData
}
