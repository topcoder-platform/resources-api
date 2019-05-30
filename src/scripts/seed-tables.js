/**
 * Seed table data in database
 */

const models = require('../models')
const logger = require('../common/logger')

logger.info('Requesting to seed data to the tables...')

const promises = []

Object.keys(models).forEach(modelName => {
  const data = require(`./seed/${modelName}.json`)
  promises.push(models[modelName].batchPut(data))
})

Promise.all(promises)
  .then(() => {
    logger.info('All tables have been inserted with the data. The processes is run asynchronously')
    process.exit()
  })
  .catch((err) => {
    logger.logFullError(err)
    process.exit(1)
  })
