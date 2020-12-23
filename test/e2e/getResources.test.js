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
const resourceUrl = `http://localhost:${config.PORT}/${config.API_VERSION}/resources?challengeId=${challengeId}`
const resource400Url = `http://localhost:${config.PORT}/${config.API_VERSION}/resources?challengeId=invalid`
const resource404Url = `http://localhost:${config.PORT}/${config.API_VERSION}/resources?challengeId=${challengeNotFoundId}`

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
      should.equal(expected.rating, 2000)
    } else {
      if (entity.memberHandle.toLowerCase() === 'denis') {
        should.equal(expected.rating, 0)
      }
      should.equal(entity.roleId, submitterRoleId)
    }
    should.exist(expected.created)
    should.exist(expected.createdBy)
    should.equal(entity.createdBy, expected.createdBy)
  }

  it('get resources by admin', async () => {
    hasCopilotRole = false
    hasReviewerRole = false
    const res = await getRequest(`${resourceUrl}&page=2&perPage=1`, token.admin)
    should.equal(res.status, 200)
    should.equal(res.headers['x-prev-page'], '1')
    should.equal(res.headers['x-next-page'], '3')
    should.equal(res.headers['x-total'], '5')
    should.equal(res.headers['x-total-pages'], '5')
    should.equal(res.body.length, 1)
  })

  it('get resources with pagination', async () => {
    hasCopilotRole = false
    hasReviewerRole = false
    const res = await getRequest(resourceUrl, token.admin)
    should.equal(res.status, 200)
    const records = res.body
    should.equal(records.length, 5)
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
    should.equal(records.length, 5)
    for (const record of records) {
      await assertResource(record.id, record)
    }
    // user hohosky should have two resources
    should.equal(hasCopilotRole, true)
    should.equal(hasReviewerRole, true)
  })

  it(`get resources using user without permission`, async () => {
    const res = await getRequest(resourceUrl, token.denis)
    should.equal(res.status, 200)
    const records = res.body
    should.equal(records.length, 1)
    should.equal(records[0].memberHandle, 'denis')
  })

  it('get resources using m2m token', async () => {
    hasCopilotRole = false
    hasReviewerRole = false
    const res = await getRequest(resourceUrl, token.m2m)
    should.equal(res.status, 200)
    const records = res.body
    should.equal(records.length, 5)
    for (const record of records) {
      await assertResource(record.id, record)
    }
    // user hohosky should have two resources
    should.equal(hasCopilotRole, true)
    should.equal(hasReviewerRole, true)
  })

  it('get resources with role id using m2m token', async () => {
    hasCopilotRole = false
    hasReviewerRole = false
    const res = await getRequest(`${resourceUrl}&roleId=${copilotRoleId}`, token.m2m)
    should.equal(res.status, 200)
    const records = res.body
    should.equal(records.length, 1)
    for (const record of records) {
      await assertResource(record.id, record)
    }
    // user hohosky should have copilot role
    should.equal(hasCopilotRole, true)
  })

  it('get resources without user login', async () => {
    const res = await getRequest(resourceUrl)
    should.equal(res.body.length, 0)
  })

  it(`test invalid url, challengeId query parameter is required`, async () => {
    try {
      await getRequest(`http://localhost:${config.PORT}/${config.API_VERSION}/resources`, token.admin)
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

  it('get resource from non-existed challenge, expected 404', async () => {
    try {
      await getRequest(resource404Url, token.m2mRead)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 404)
      should.equal(_.get(err, 'response.body.message'), `Challenge ID ${challengeNotFoundId} not found`)
    }
  })
})
