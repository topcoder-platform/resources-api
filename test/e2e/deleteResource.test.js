/**
 * E2E test of the Challenge Resource API - delete resource endpoint.
 */

const _ = require('lodash')
const config = require('config')
const should = require('should')
const helper = require('../../src/common/helper')
const { deleteRequest, getRoleIds } = require('../common/testHelper')
const { token, requestBody, user } = require('../common/testData')

const challengeId = 'fe6d0a58-ce7d-4521-8501-b8132b1c0391'
const challengeNotFoundId = '11111111-ce7d-4521-8501-b8132b1c0391'
const resourceUrl = `http://localhost:${config.PORT}/challenges/${challengeId}/resources`
const resource400Url = `http://localhost:${config.PORT}/challenges/invalid/resources`
const resource404Url = `http://localhost:${config.PORT}/challenges/${challengeNotFoundId}/resources`
const resources = requestBody.resources

module.exports = describe('Delete resource endpoint', () => {
  let copilotRoleId
  let observerRoleId
  let submitterRoleId

  before(async () => {
    const ret = await getRoleIds()
    copilotRoleId = ret.copilotRoleId
    observerRoleId = ret.observerRoleId
    submitterRoleId = ret.submitterRoleId
  })

  it(`delete resource that user doesn't have, expected 400`, async () => {
    const body = resources.createBody('HoHosky', observerRoleId)
    try {
      await deleteRequest(resourceUrl, body, token.m2mModify)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 400)
      should.equal(_.get(err, 'response.body.message'), `User hohosky doesn't have resource with roleId: ${observerRoleId} in challenge ${challengeId}`)
    }
  })

  it('delete resource using non-existed role, expected 400', async () => {
    const body = resources.createBody('ghostar', challengeId)
    try {
      await deleteRequest(resourceUrl, body, token.m2m)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 400)
      should.equal(_.get(err, 'response.body.message'), `No resource role found with id: ${challengeId}.`)
    }
  })

  it(`delete resource member doesn't exist, expected 400`, async () => {
    const body = resources.createBody('123abcx', observerRoleId)
    try {
      await deleteRequest(resourceUrl, body, token.admin)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 400)
      should.equal(_.get(err, 'response.body.message'), `User with handle: 123abcx doesn't exist`)
    }
  })

  let { stringFields, requiredFields, testBody } = resources

  it(`test invalid path parameter, challengeId must be UUID`, async () => {
    try {
      await deleteRequest(resource400Url, testBody, token.admin)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 400)
      should.equal(_.get(err, 'response.body.message'), `"challengeId" must be a valid GUID`)
    }
  })

  for (const stringField of stringFields) {
    it(`test invalid parameters, invalid string type field ${stringField}`, async () => {
      let body = _.cloneDeep(testBody)
      _.set(body, stringField, 123)
      try {
        await deleteRequest(resourceUrl, body, token.admin)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 400)
        should.equal(_.get(err, 'response.body.message'), `"${stringField}" must be a string`)
      }
    })
  }

  for (const requiredField of requiredFields) {
    it(`test invalid parameters, required field ${requiredField} is missing`, async () => {
      let body = _.cloneDeep(testBody)
      body = _.omit(body, requiredField)
      try {
        await deleteRequest(resourceUrl, body, token.admin)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 400)
        should.equal(_.get(err, 'response.body.message'), `"${requiredField}" is required`)
      }
    })
  }

  it(`test without token, expected 401`, async () => {
    try {
      await deleteRequest(resourceUrl, testBody)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'No token provided.')
    }
  })

  it(`test with invalid token(invalid), expected 401`, async () => {
    try {
      await deleteRequest(resourceUrl, testBody, 'invalid')
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'Invalid Token.')
    }
  })

  it(`test with invalid token(expired), expected 401`, async () => {
    try {
      await deleteRequest(resourceUrl, testBody, token.expired)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'Failed to authenticate token.')
    }
  })

  it(`test with user without permission, expected 403`, async () => {
    const body = resources.createBody('tonyj', submitterRoleId)
    try {
      await deleteRequest(resourceUrl, body, token.denis)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 403)
      should.equal(_.get(err, 'response.body.message'), 'Only M2M, admin or user with full access role can perform this action')
    }
  })

  it(`test with invalid M2M token, expected 403`, async () => {
    const body = resources.createBody('tonyj', submitterRoleId)
    try {
      await deleteRequest(resourceUrl, body, token.m2mRead)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 403)
      should.equal(_.get(err, 'response.body.message'), 'You are not allowed to perform this action!')
    }
  })

  it('delete resource for non-existed challenge, expected 404', async () => {
    const body = resources.createBody('ghostar', observerRoleId)
    try {
      await deleteRequest(resource404Url, body, token.m2m)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 404)
      should.equal(_.get(err, 'response.body.message'), `Challenge with id: ${challengeNotFoundId} doesn't exist.`)
    }
  })

  it('delete resource using m2m token', async () => {
    const body = resources.createBody('ghostar', submitterRoleId)
    const res = await deleteRequest(resourceUrl, body, token.m2m)
    should.equal(res.status, 200)
    should.exist(res.body.id)
    try {
      await helper.getById('Resource', res.body.id)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'NotFoundError')
    }
    should.equal(res.body.challengeId, challengeId)
    should.exist(res.body.memberId)
    should.equal(res.body.memberHandle.toLowerCase(), 'ghostar')
    should.equal(res.body.roleId, submitterRoleId)
    should.exist(res.body.created)
    should.equal(res.body.createdBy, user.m2m.sub)
  })

  it('delete resource by user', async () => {
    const body = resources.createBody('DENIS', submitterRoleId)
    const res = await deleteRequest(resourceUrl, body, token.hohosky)
    should.equal(res.status, 200)
    should.exist(res.body.id)
    try {
      await helper.getById('Resource', res.body.id)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'NotFoundError')
    }
    should.equal(res.body.challengeId, challengeId)
    should.exist(res.body.memberId)
    should.equal(res.body.memberHandle.toLowerCase(), 'denis')
    should.equal(res.body.roleId, submitterRoleId)
    should.exist(res.body.created)
    should.equal(res.body.createdBy.toLowerCase(), 'hohosky')
  })

  it('delete resource by admin', async () => {
    const body = resources.createBody('HoHoSKY', copilotRoleId)
    const res = await deleteRequest(resourceUrl, body, token.admin)
    should.equal(res.status, 200)
    should.exist(res.body.id)
    try {
      await helper.getById('Resource', res.body.id)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'NotFoundError')
    }
    should.equal(res.body.challengeId, challengeId)
    should.exist(res.body.memberId)
    should.equal(res.body.memberHandle.toLowerCase(), 'hohosky')
    should.equal(res.body.roleId, copilotRoleId)
    should.exist(res.body.created)
    should.equal(res.body.createdBy.toLowerCase(), 'tonyj')
  })
})
