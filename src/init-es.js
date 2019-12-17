/**
 * Initialize elastic search.
 * It will re-create configured indices in elasticsearch.
 */
require('../app-bootstrap')
const config = require('config')
const logger = require('./common/logger')
const helper = require('./common/helper')

const initES = async () => {
  logger.info(`Re-create index ${config.ES.RESOURCE_INDEX} in Elasticsearch.`)
  await helper.createESIndex(config.ES.RESOURCE_INDEX)

  logger.info(`Re-create index ${config.ES.RESOURCE_ROLE_INDEX} in Elasticsearch.`)
  await helper.createESIndex(config.ES.RESOURCE_ROLE_INDEX)
}

initES().then(() => {
  logger.info('Done!')
  process.exit()
}).catch((e) => {
  logger.logFullError(e)
  process.exit(1)
})
