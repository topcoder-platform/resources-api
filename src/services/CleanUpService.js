/**
 * This service provides operations to clean up the environment for running automated tests.
 */

const _ = require('lodash')
const config = require('config')
const logger = require('../common/logger')
const prisma = require('../common/prisma').getClient()

/**
 * Clear the postman test data. The main function of this class.
 * @returns {Promise<void>}
 */
const cleanUpTestData = async () => {
  logger.info('clear the test data from postman test!')
  let roles = await prisma.resourceRole.findMany({
    where: {
      name: { startsWith: config.AUTOMATED_TESTING_NAME_PREFIX }
    }
  })
  const roleIds = _.map(roles, 'id')
  logger.info('Clearing ResourceRolePhaseDependency')
  await prisma.resourceRolePhaseDependency.deleteMany({ where: { resourceRoleId: { in: roleIds } } })
  logger.info('Clearing Resource')
  await prisma.resource.deleteMany({ where: { roleId: { in: roleIds } } })
  logger.info('Clearing ResourceRole')
  await prisma.resourceRole.deleteMany({ where: { id: { in: roleIds } } })
  logger.info('clear the test data from postman test completed!')
}

module.exports = {
  cleanUpTestData
}

logger.buildService(module.exports)
