/**
 * Health Check Service
 */
const config = require('config')
const helper = require('../common/helper')
const errors = require('../common/errors')
const { DynamoDB } = require('../models')

/**
 * Check if the DynamoDB connection is active
 */
async function check () {
  const checkDynamoDB = new Promise((resolve, reject) => {
    DynamoDB.listTables({}, (err, data) => {
      if (err) {
        return reject(new errors.ServiceUnavailable('DynamoDB instance cannot be reached'))
      }
      return resolve()
    })
  })

  const timeOutBreak = new Promise((resolve, reject) => {
    setTimeout(reject, config.DYNAMODB.TIMEOUT, new errors.ServiceUnavailable('DynamoDB instance cannot be reached'))
  })

  await Promise.race([checkDynamoDB, timeOutBreak])

  // check ES connection
  try {
    await helper.getESClient().ping({ requestTimeout: 10000 })
  } catch (e) {
    throw new errors.ServiceUnavailable(`Elasticsearch is unavailable, ${e.message}`)
  }

  return {
    checksRun: 1
  }
}

module.exports = {
  check
}
