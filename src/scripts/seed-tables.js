/**
 * Seed table data in database
 */
const { get } = require('lodash')
const models = require('../models')
const logger = require('../common/logger')

logger.info('Requesting to seed data to the resources tables...')

const promises = []

Object.keys(models).forEach(modelName => {
  try {
    const data = require(`./seed/${modelName}.json`)
    logger.info(`Inserting ${get(data, 'length')} records in table ${modelName}`)
    promises.push(models[modelName].batchPut(data))
  } catch (e) {
    logger.warn(`No records will be inserted in table ${modelName} error: ${e}`)
  }
})

Promise.all(promises)
  .then(() => {
    logger.info('All tables have been inserted with the data. The processes is run asynchronously')
    process.exit()
  })
  .catch((err) => {
    logger.error(`Error loading resource seed data ${err}`)
    logger.logFullError(err)
    process.exit(1)
  })
