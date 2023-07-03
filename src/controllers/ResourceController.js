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
  const result = await service.getResources(req.authUser, req.query.challengeId, req.query.roleId, req.query.memberId, req.query.memberHandle, req.query.page, req.query.perPage, req.query.sortBy, req.query.sortOrder)
  helper.setResHeaders(req, res, result)
  res.send(result.data)
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
  helper.setResHeaders(req, res, result)
  res.send(result.data)
}

/**
 * Get resource count of a challenge
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function getResourceCount (req, res) {
  const result = await service.getResourceCount(req.query.challengeId, req.query.roleId)
  res.send(result)
}

module.exports = {
  getResources,
  createResource,
  deleteResource,
  listChallengesByMember,
  getResourceCount
}
