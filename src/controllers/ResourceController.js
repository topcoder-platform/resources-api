/**
 * Controller for resource endpoints
 */

const service = require('../services/ResourceService')
const helper = require('../common/helper')

/**
 * Get all resources of a challenge
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function getResources (req, res) {
  const result = await service.getResources(req.authUser, req.query.challengeId, req.query.roleId)
  helper.setResHeaders(req, res, result)
  res.send(result)
}

/**
 * Create resource for a challenge.
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function createResource (req, res) {
  const result = await service.createResource(req.authUser, req.body)
  res.send(result)
}

/**
 * Delete resource from a challenge.
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function deleteResource (req, res) {
  const result = await service.deleteResource(req.authUser, req.body)
  res.send(result)
}

/**
 * List all challenge ids that given member has access to.
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function listChallengesByMember (req, res) {
  const result = await service.listChallengesByMember(req.params.memberId, req.query)
  res.send(result)
}

module.exports = {
  getResources,
  createResource,
  deleteResource,
  listChallengesByMember
}
