/**
 * This file defines helper methods
 */

const config = require('config')
const request = require('superagent')
const should = require('should')
const helper = require('../../src/common/helper')

/**
 * Set request Headers
 */
function setheaders (req, token) {
  if (token) {
    req.set('Authorization', `Bearer ${token}`)
  }
  return req
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
}

/**
 * Uses superagent to proxy get request
 * @param {String} url the url
 * @param {String} token the token
 * @returns {Object} the response
 */
async function getRequest (url, token) {
  return setheaders(request.get(url), token)
}

/**
 * Uses superagent to proxy put request
 * @param {String} url the url
 * @param {Object} body the request body
 * @param {String} token the token
 * @returns {Object} the response
 */
async function putRequest (url, body, token) {
  return setheaders(request.put(url).send(body), token)
}

/**
 * Uses superagent to proxy post request
 * @param {String} url the url
 * @param {Object} body the request body
 * @param {String} token the token
 * @returns {Object} the response
 */
async function postRequest (url, body, token) {
  return setheaders(request.post(url).send(body), token)
}

/**
 * Uses superagent to proxy delete request
 * @param {String} url the url
 * @param {Object} body the request body
 * @param {String} token the token
 * @returns {Object} the response
 */
async function deleteRequest (url, body, token) {
  return setheaders(request.delete(url).send(body), token)
}

/**
 * Get resource role ids.
 */
async function getRoleIds () {
  const roles = await helper.scan('ResourceRole')
  let copilotRoleId, observerRoleId, submitterRoleId, reviewerRoleId
  for (const role of roles) {
    if (role.name.toLowerCase() === 'co-pilot') {
      copilotRoleId = role.id
    } else if (role.name.toLowerCase() === 'observer') {
      observerRoleId = role.id
    } else if (role.name.toLowerCase() === 'submitter') {
      submitterRoleId = role.id
    } else if (role.name.toLowerCase() === 'reviewer') {
      reviewerRoleId = role.id
    }
  }
  return { copilotRoleId, observerRoleId, submitterRoleId, reviewerRoleId }
}

let errorLogs

/**
 * Initialize the errorLogs
 */
function initLogs (logs) {
  errorLogs = logs
}

/**
 * Assert Joi validation error
 * @param err the error
 * @param message the message
 */
function assertValidationError (err, message) {
  err.isJoi.should.be.true()
  should.equal(err.name, 'ValidationError')
  err.details.map(x => x.message).should.containEql(message)
  errorLogs.should.not.be.empty()
  errorLogs.should.containEql(err.stack)
}

/**
 * Assert error which is not thrown by Joi
 * @param err the error
 * @param message the message
 */
function assertError (err, message) {
  should.equal(err.message.indexOf(message) >= 0, true)
  errorLogs.should.not.be.empty()
  errorLogs.should.containEql(err.stack)
}

/**
 * Assert resource role entity in database.
 * @param {String} id the entity id
 * @param {Object} expected the expected data
 */
async function assertResourceRole (id, expected) {
  should.exist(id)
  const entity = await helper.getById('ResourceRole', id)
  should.equal(entity.name, expected.name)
  should.equal(entity.fullReadAccess, expected.fullReadAccess)
  should.equal(entity.fullWriteAccess, expected.fullWriteAccess)
  should.equal(entity.isActive, expected.isActive)
  should.equal(entity.selfObtainable, expected.selfObtainable)
}

/**
 * Assert resource entity created in database.
 * @param {String} id the entity id
 * @param {Object} expected the expected data
 */
async function assertResource (id, expected) {
  should.exist(id)
  const entity = await helper.getById('Resource', id)
  should.equal(entity.challengeId, expected.challengeId)
  should.equal(entity.memberId, expected.memberId)
  should.equal(entity.memberHandle.toLowerCase(), expected.memberHandle.toLowerCase())
  should.equal(entity.roleId, expected.roleId)
  should.exist(expected.created)
  should.equal(entity.createdBy, expected.createdBy)
}

/**
 * Assert resource role phase dependency entity in database.
 * @param {String} id the entity id
 * @param {Object} expected the expected data
 */
async function assertResourceRolePhaseDependency (id, expected) {
  should.exist(id)
  const entity = await helper.getById('ResourceRolePhaseDependency', id)
  should.equal(entity.phaseId, expected.phaseId)
  should.equal(entity.resourceRoleId, expected.resourceRoleId)
  should.equal(entity.phaseState, expected.phaseState)
}

/**
 * Clear all resource role phase dependencies.
 */
async function clearDependencies () {
  const dependencies = await helper.scan('ResourceRolePhaseDependency')
  for (const d of dependencies) {
    await d.delete()
  }
}

/**
 * Clear the ES documents.
 */
async function initES () {
  const client = helper.getESClient()
  await client.deleteByQuery({
    index: config.ES.ES_INDEX,
    type: config.ES.ES_TYPE,
    body: {
      query: {
        match_all: {}
      }
    }
  })
}

module.exports = {
  getRequest,
  putRequest,
  postRequest,
  deleteRequest,
  getRoleIds,
  assertError,
  assertValidationError,
  assertResourceRole,
  assertResource,
  assertResourceRolePhaseDependency,
  initLogs,
  clearDependencies,
  initES
}
