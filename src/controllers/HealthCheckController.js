/**
 * Health Check Controller
 */

const service = require('../services/HealthCheckService')

/**
 * Health check
 * @param req the http request
 * @param res the http response
 */
async function check (req, res) {
  res.json(await service.check())
}

module.exports = {
  check
}
