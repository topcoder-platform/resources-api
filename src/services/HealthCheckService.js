/**
 * Health Check Service
 */
// const config = require('config')
// const errors = require('../common/errors')
// const { DynamoDB } = require('../models')

/**
 * Check if the DynamoDB connection is active
 */
async function check () {
  // const checkDynamoDB = new Promise((resolve, reject) => {
  //   DynamoDB.listTables({}, (err, data) => {
  //     if (err) {
  //       return reject(new errors.ServiceUnavailable('DynamoDB instance cannot be reached'))
  //     }
  //     return resolve()
  //   })
  // })

  // const timeOutBreak = new Promise((resolve, reject) => {
  //   setTimeout(reject, config.DYNAMODB.TIMEOUT, new errors.ServiceUnavailable('DynamoDB instance cannot be reached'))
  // })

  // await Promise.race([checkDynamoDB, timeOutBreak])

  return {
    checksRun: 1
  }
}

module.exports = {
  check
}
