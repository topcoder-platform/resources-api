/**
 * Controller for resource role endpoints
 */

const service = require('../services/ResourceRoleService')

/**
 * Get resource roles.
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function getResourceRoles (req, res) {
  const result = await service.getResourceRoles(req.query)
  res.send(result)
}

/**
 * Create resource role.
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function createResourceRole (req, res) {
  const result = await service.createResourceRole(req.body)
  res.send(result)
}

/**
 * Update resource role.
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function updateResourceRole (req, res) {
  const result = await service.updateResourceRole(req.params.resourceRoleId, req.body)
  res.send(result)
}

module.exports = {
  getResourceRoles,
  createResourceRole,
  updateResourceRole
}
