/**
 * E2E test of the Challenge Resource API - get resources endpoint.
 */

const _ = require('lodash')
const config = require('config')
const should = require('should')
const helper = require('../../src/common/helper')
const { getRequest, getRoleIds } = require('../common/testHelper')
const { token } = require('../common/testData')

const challengeId = 'fe6d0a58-ce7d-4521-8501-b8132b1c0391'
const challengeNotFoundId = '11111111-ce7d-4521-8501-b8132b1c0391'
const resourceUrl = `http://localhost:${config.PORT}/resources?challengeId=${challengeId}`
const resource400Url = `http://localhost:${config.PORT}/resources?challengeId=invalid`
const resource404Url = `http://localhost:${config.PORT}/resources?challengeId=${challengeNotFoundId}`

module.exports = describe('Get resource endpoint', () => {
  let copilotRoleId
  let submitterRoleId
  let reviewerRoleId

  before(async () => {
    const ret = await getRoleIds()
    copilotRoleId = ret.copilotRoleId
    submitterRoleId = ret.submitterRoleId
    reviewerRoleId = ret.reviewerRoleId
  })

  let hasCopilotRole, hasReviewerRole

  /**
   * Assert resource entity in database.
   * @param {String} id the entity id
   * @param {Object} expected the expected data
   */
  const assertResource = async (id, expected) => {
    should.exist(id)
    const entity = await helper.getById('Resource', id)
    should.equal(entity.challengeId, challengeId)
    should.equal(entity.memberId, expected.memberId)
    should.equal(entity.memberHandle.toLowerCase(), expected.memberHandle.toLowerCase())
    should.equal(entity.roleId, expected.roleId)
    if (entity.memberHandle.toLowerCase() === 'hohosky') {
      if (entity.roleId === copilotRoleId) {
        hasCopilotRole = true
      }
      if (entity.roleId === reviewerRoleId) {
        hasReviewerRole = true
      }
    } else {
      should.equal(entity.roleId, submitterRoleId)
    }
    should.exist(expected.created)
    should.exist(expected.createdBy)
    should.equal(entity.createdBy, expected.createdBy)
  }

  it('get resources by admin', async () => {
    hasCopilotRole = false
    hasReviewerRole = false
    const res = await getRequest(resourceUrl, token.admin)
    should.equal(res.status, 200)
    const records = res.body
    should.equal(records.length, 4)
    for (const record of records) {
      await assertResource(record.id, record)
    }
    // user hohosky should have two resources
    should.equal(hasCopilotRole, true)
    should.equal(hasReviewerRole, true)
  })

  it('get resources by user has full-access permission', async () => {
    hasCopilotRole = false
    hasReviewerRole = false
    const res = await getRequest(resourceUrl, token.hohosky)
    should.equal(res.status, 200)
    const records = res.body
    should.equal(records.length, 4)
    for (const record of records) {
      await assertResource(record.id, record)
    }
    // user hohosky should have two resources
    should.equal(hasCopilotRole, true)
    should.equal(hasReviewerRole, true)
  })

  it('get resources using m2m token', async () => {
    hasCopilotRole = false
    hasReviewerRole = false
    const res = await getRequest(resourceUrl, token.m2m)
    should.equal(res.status, 200)
    const records = res.body
    should.equal(records.length, 4)
    for (const record of records) {
      await assertResource(record.id, record)
    }
    // user hohosky should have two resources
    should.equal(hasCopilotRole, true)
    should.equal(hasReviewerRole, true)
  })

  it(`test invalid url, challengeId query parameter is required`, async () => {
    try {
      await getRequest(`http://localhost:${config.PORT}/resources`, token.admin)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 400)
      should.equal(_.get(err, 'response.body.message'), `"challengeId" is required`)
    }
  })

  it(`test invalid query parameter, challengeId must be UUID`, async () => {
    try {
      await getRequest(resource400Url, token.admin)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 400)
      should.equal(_.get(err, 'response.body.message'), `"challengeId" must be a valid GUID`)
    }
  })

  it(`test without token, expected 401`, async () => {
    try {
      await getRequest(resourceUrl)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'No token provided.')
    }
  })

  it(`test with invalid token(invalid), expected 401`, async () => {
    try {
      await getRequest(resourceUrl, 'invalid')
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'Invalid Token.')
    }
  })

  it(`test with invalid token(expired), expected 401`, async () => {
    try {
      await getRequest(resourceUrl, token.expired)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'Failed to authenticate token.')
    }
  })

  it(`test with user without permission, expected 403`, async () => {
    try {
      await getRequest(resourceUrl, token.denis)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 403)
      should.equal(_.get(err, 'response.body.message'), 'Only M2M, admin or user with full access role can perform this action')
    }
  })

  it(`test with invalid M2M token, expected 403`, async () => {
    try {
      await getRequest(resourceUrl, token.m2mModify)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 403)
      should.equal(_.get(err, 'response.body.message'), 'You are not allowed to perform this action!')
    }
  })

  it('get resource from non-existed challenge, expected 404', async () => {
    try {
      await getRequest(resource404Url, token.m2mRead)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 404)
      should.equal(_.get(err, 'response.body.message'), `Challenge with id: ${challengeNotFoundId} doesn't exist.`)
    }
  })
})
