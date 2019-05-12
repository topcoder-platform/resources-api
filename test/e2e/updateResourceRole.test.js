/**
 * E2E test of the Challenge Resource API - update resource roles endpoint.
 */

const _ = require('lodash')
const config = require('config')
const should = require('should')
const { putRequest, getRoleIds, assertResourceRole } = require('../common/testHelper')
const { token, requestBody } = require('../common/testData')

const resourceRoleUrl = `http://localhost:${config.PORT}/resourceRoles`
const resourceRoles = requestBody.resourceRoles

module.exports = describe('Update resource roles endpoint', () => {
  let copilotRoleId

  before(async () => {
    const ret = await getRoleIds()
    copilotRoleId = ret.copilotRoleId
  })

  it('update resource role using m2m all token', async () => {
    const body = resourceRoles.createBody('UPDATE-CO-PILOT', true, false)
    const res = await putRequest(`${resourceRoleUrl}/${copilotRoleId}`, body, token.m2m)
    should.equal(res.status, 200)
    should.equal(copilotRoleId, res.body.id)
    await assertResourceRole(copilotRoleId, res.body)
  })

  it('update resource role using m2m resource roles token', async () => {
    const body = resourceRoles.createBody('UPDATE-CO-PILOT', false, false)
    const res = await putRequest(`${resourceRoleUrl}/${copilotRoleId}`, body, token.m2mModify)
    should.equal(res.status, 200)
    should.equal(copilotRoleId, res.body.id)
    await assertResourceRole(copilotRoleId, res.body)
  })

  it('update resource role via admin', async () => {
    const body = resourceRoles.createBody('CO-PILOT', true, true)
    const res = await putRequest(`${resourceRoleUrl}/${copilotRoleId}`, body, token.admin)
    should.equal(res.status, 200)
    should.equal(copilotRoleId, res.body.id)
    await assertResourceRole(copilotRoleId, res.body)
  })

  let { stringFields, booleanFields, requiredFields, testBody } = resourceRoles

  for (const stringField of stringFields) {
    it(`test invalid parameters, invalid string type field ${stringField}`, async () => {
      let body = _.cloneDeep(testBody)
      _.set(body, stringField, 123)
      try {
        await putRequest(`${resourceRoleUrl}/${copilotRoleId}`, body, token.admin)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 400)
        should.equal(_.get(err, 'response.body.message'), `"${stringField}" must be a string`)
      }
    })
  }

  for (const booleanField of booleanFields) {
    it(`test invalid parameters, invalid boolean type field ${booleanField}`, async () => {
      let body = _.cloneDeep(testBody)
      _.set(body, booleanField, 123)
      try {
        await putRequest(`${resourceRoleUrl}/${copilotRoleId}`, body, token.admin)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 400)
        should.equal(_.get(err, 'response.body.message'), `"${booleanField}" must be a boolean`)
      }
    })
  }

  for (const requiredField of requiredFields) {
    it(`test invalid parameters, required field ${requiredField} is missing`, async () => {
      let body = _.cloneDeep(testBody)
      body = _.omit(body, requiredField)
      try {
        await putRequest(`${resourceRoleUrl}/${copilotRoleId}`, body, token.admin)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 400)
        should.equal(_.get(err, 'response.body.message'), `"${requiredField}" is required`)
      }
    })
  }

  it(`test invalid path parameter, resourceRoleId must be UUID`, async () => {
    try {
      await putRequest(`${resourceRoleUrl}/invalid`, testBody, token.admin)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 400)
      should.equal(_.get(err, 'response.body.message'), `"resourceRoleId" must be a valid GUID`)
    }
  })

  it(`test without token, expected 401`, async () => {
    try {
      await putRequest(`${resourceRoleUrl}/${copilotRoleId}`, testBody)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'No token provided.')
    }
  })

  it(`test with invalid token(invalid), expected 401`, async () => {
    try {
      await putRequest(`${resourceRoleUrl}/${copilotRoleId}`, testBody, 'invalid')
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'Invalid Token.')
    }
  })

  it(`test with invalid token(expired), expected 401`, async () => {
    try {
      await putRequest(`${resourceRoleUrl}/${copilotRoleId}`, testBody, token.expired)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'Failed to authenticate token.')
    }
  })

  it(`test with user token, expected 403`, async () => {
    try {
      await putRequest(`${resourceRoleUrl}/${copilotRoleId}`, testBody, token.denis)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 403)
      should.equal(_.get(err, 'response.body.message'), 'You are not allowed to perform this action!')
    }
  })

  it(`test with invalid M2M token, expected 403`, async () => {
    try {
      await putRequest(`${resourceRoleUrl}/${copilotRoleId}`, testBody, token.m2mRead)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 403)
      should.equal(_.get(err, 'response.body.message'), 'You are not allowed to perform this action!')
    }
  })

  it(`test with not founded resource role, expected 404`, async () => {
    try {
      const id = 'fe6d0a58-ce7d-4521-8501-b8132b1c0391'
      await putRequest(`${resourceRoleUrl}/${id}`, testBody, token.admin)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 404)
      should.equal(_.get(err, 'response.body.message'), `ResourceRole with id: fe6d0a58-ce7d-4521-8501-b8132b1c0391 doesn't exist`)
    }
  })

  it(`update resource role name duplication, expected 409`, async () => {
    const body = resourceRoles.createBody('SUBMITTER', false, true)
    try {
      await putRequest(`${resourceRoleUrl}/${copilotRoleId}`, body, token.admin)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 409)
      should.equal(_.get(err, 'response.body.message'), 'ResourceRole with name: SUBMITTER already exist.')
    }
  })
})
