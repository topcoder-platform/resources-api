/**
 * Controller for cleaning up test data
 */

const service = require('../services/CleanUpService')

/**
 * Get all resources of a challenge
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function cleanUpTestData (req, res) {
  await service.cleanUpTestData()
  res.sendStatus(200)
}

module.exports = {
  cleanUpTestData
}
