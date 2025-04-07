/**
 * View table data.
 */

const _ = require('lodash')
const logger = require('../common/logger')
const prisma = require('../common/prisma').getClient()

const viewData = async (modelName) => {
  const prismaModel = _.camelCase(modelName)
  const records = await prisma[prismaModel].findMany({})
  console.log(records)
}

const modelNames = ['Resource', 'ResourceRole', 'ResourceRolePhaseDependency', 'MemberProfile', 'MemberStats']

if (process.argv.length === 2) {
  logger.info(`Please provide one of the following table name: [${modelNames}]`)
  process.exit(1)
} else {
  const modelName = process.argv[2]
  if (modelNames.includes(modelName)) {
    viewData(modelName).then(() => {
      logger.info('Done!')
      process.exit()
    }).catch((e) => {
      logger.logFullError(e)
      process.exit(1)
    })
  } else {
    logger.info(`Please provide one of the following table name: [${modelNames}]`)
    process.exit(1)
  }
}
