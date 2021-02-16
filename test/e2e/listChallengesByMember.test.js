/**
 * E2E test of the Challenge Resource API - list challenges by member.
 */

const _ = require('lodash')
const config = require('config')
const should = require('should')
const { getRequest, getRoleIds } = require('../common/testHelper')
const { token } = require('../common/testData')

const challengeId1 = 'fe6d0a58-ce7d-4521-8501-b8132b1c0391'
const challengeId2 = 'fe6d0a58-ce7d-4521-8501-b8132b1c0392'
const challengeId3 = 'fe6d0a58-ce7d-4521-8501-b8132b1c0393'
const resourceUrl = `http://localhost:${config.PORT}/${config.API_VERSION}/resources`

module.exports = describe('Create resource endpoint', () => {
  let submitterRoleId
  let reviewerRoleId
  let observerRoleId

  before(async () => {
    const ret = await getRoleIds()
    submitterRoleId = ret.submitterRoleId
    reviewerRoleId = ret.reviewerRoleId
    observerRoleId = ret.observerRoleId
  })

  it('get challenges hohosky can access', async () => {
    const res = await getRequest(`${resourceUrl}/16096823/challenges`, token.admin)
    should.equal(res.status, 200)
    should.equal(res.body.length, 1)
    should.equal(res.body[0], challengeId1)
  })

  it('get challenges ghostar can access', async () => {
    const res = await getRequest(`${resourceUrl}/151743/challenges`, token.denis)
    should.equal(res.status, 200)
    should.equal(res.body.length, 3)
    should.equal(res.body.includes(challengeId1), true)
    should.equal(res.body.includes(challengeId2), true)
    should.equal(res.body.includes(challengeId3), true)
  })

  it('get challenges ghostar can access with filter 1', async () => {
    const res = await getRequest(`${resourceUrl}/151743/challenges?resourceRoleId=${submitterRoleId}`, token.hohosky)
    should.equal(res.status, 200)
    should.equal(res.body.length, 1)
    should.equal(res.body[0], challengeId1)
  })

  it('get challenges ghostar can access with filter 2', async () => {
    const res = await getRequest(`${resourceUrl}/151743/challenges?resourceRoleId=${reviewerRoleId}`, token.m2mRead)
    should.equal(res.status, 200)
    should.equal(res.body.length, 2)
    should.equal(res.body.includes(challengeId2), true)
    should.equal(res.body.includes(challengeId3), true)
  })

  it('get challenges ghostar can access with filter 3', async () => {
    const res = await getRequest(`${resourceUrl}/151743/challenges?resourceRoleId=${observerRoleId}`, token.m2m)
    should.equal(res.status, 200)
    should.equal(res.body.length, 0)
  })

  it('get challenges by non existed user', async () => {
    const res = await getRequest(`${resourceUrl}/111111111/challenges`, token.m2m)
    should.equal(res.status, 200)
    should.equal(res.body.length, 0)
  })

  it(`get challenges for user with non existed role`, async () => {
    const res = await getRequest(`${resourceUrl}/151743/challenges?resourceRoleId=${challengeId1}`, token.m2m)
    should.equal(res.status, 200)
    should.equal(res.body.length, 0)
  })

  it(`test invalid parameters, resourceRoleId should be UUID`, async () => {
    try {
      await getRequest(`${resourceUrl}/151743/challenges?resourceRoleId=invalid`, token.m2m)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 400)
      should.equal(_.get(err, 'response.body.message'), `"resourceRoleId" must be a valid GUID`)
    }
  })

  it(`test without token, expected 401`, async () => {
    try {
      await getRequest(`${resourceUrl}/151743/challenges`)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'No token provided.')
    }
  })

  it(`test with invalid token(invalid), expected 401`, async () => {
    try {
      await getRequest(`${resourceUrl}/151743/challenges`, 'invalid')
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'Invalid Token.')
    }
  })

  it(`test with invalid token(expired), expected 401`, async () => {
    try {
      await getRequest(`${resourceUrl}/151743/challenges`, token.expired)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'Failed to authenticate token.')
    }
  })

  it(`test with invalid M2M token, expected 403`, async () => {
    try {
      await getRequest(`${resourceUrl}/151743/challenges`, token.m2mModify)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 403)
      should.equal(_.get(err, 'response.body.message'), 'You are not allowed to perform this action!')
    }
  })
})
