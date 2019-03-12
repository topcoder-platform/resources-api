/**
 * Controller for resource endpoints
 */

const service = require('../services/ResourceService')

/**
 * Get all resources of a challenge
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function getResources (req, res) {
  const result = await service.getResources(req.authUser, req.params.challengeId)
  res.send(result)
}

/**
 * Create resource for a challenge.
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function createResource (req, res) {
  const result = await service.createResource(req.authUser, req.params.challengeId, req.body)
  res.send(result)
}

/**
 * Delete resource from a challenge.
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function deleteResource (req, res) {
  const result = await service.deleteResource(req.authUser, req.params.challengeId, req.body)
  res.send(result)
}

module.exports = {
  getResources,
  createResource,
  deleteResource
}
