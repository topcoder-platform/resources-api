/**
 * Controller for resource role phase dependency endpoints
 */

const service = require('../services/ResourceRolePhaseDependencyService')

/**
 * Get dependencies.
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function getDependencies (req, res) {
  const result = await service.getDependencies(req.query)
  res.send(result)
}

/**
 * Create dependency.
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function createDependency (req, res) {
  const result = await service.createDependency(req.body)
  res.send(result)
}

/**
 * Update dependency.
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function updateDependency (req, res) {
  const result = await service.updateDependency(req.params.id, req.body)
  res.send(result)
}

/**
 * Delete dependency.
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function deleteDependency (req, res) {
  const result = await service.deleteDependency(req.params.id)
  res.send(result)
}

module.exports = {
  getDependencies,
  createDependency,
  updateDependency,
  deleteDependency
}
