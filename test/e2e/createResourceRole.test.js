/**
 * E2E test of the Challenge Resource API - create resource role endpoint.
 */

const _ = require('lodash')
const config = require('config')
const should = require('should')
const { postRequest, assertResourceRole } = require('../common/testHelper')
const { token, requestBody } = require('../common/testData')

const resourceRoleUrl = `http://localhost:${config.PORT}/resourceRoles`
const resourceRoles = requestBody.resourceRoles

module.exports = describe('Create resource role endpoint', () => {
  it('create active full-access resource role by admin', async () => {
    const body = resourceRoles.createBody('co-pilot', true, true, false)
    const res = await postRequest(resourceRoleUrl, body, token.admin)
    should.equal(res.status, 200)
    const copilotRoleId = res.body.id
    await assertResourceRole(copilotRoleId, body)
  })

  it('create inactive full-access resource role by M2M', async () => {
    const body = resourceRoles.createBody('Observer', true, false, false)
    const res = await postRequest(resourceRoleUrl, body, token.m2m)
    should.equal(res.status, 200)
    const observerRoleId = res.body.id
    await assertResourceRole(observerRoleId, body)
  })

  it('create active not full-access resource role by admin', async () => {
    const body = resourceRoles.createBody('submitter', false, true, true)
    const res = await postRequest(resourceRoleUrl, body, token.admin)
    should.equal(res.status, 200)
    const submitterRoleId = res.body.id
    await assertResourceRole(submitterRoleId, body)
  })

  it('create reviewer resource role', async () => {
    const body = resourceRoles.createBody('reviewer', false, true, false)
    const res = await postRequest(resourceRoleUrl, body, token.admin)
    should.equal(res.status, 200)
    const reviewerRoleId = res.body.id
    await assertResourceRole(reviewerRoleId, body)
  })

  let { stringFields, booleanFields, requiredFields, testBody } = resourceRoles

  for (const stringField of stringFields) {
    it(`test invalid parameters, invalid string type field ${stringField}`, async () => {
      let body = _.cloneDeep(testBody)
      _.set(body, stringField, 123)
      try {
        await postRequest(resourceRoleUrl, body, token.admin)
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
        await postRequest(resourceRoleUrl, body, token.admin)
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
        await postRequest(resourceRoleUrl, body, token.admin)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 400)
        should.equal(_.get(err, 'response.body.message'), `"${requiredField}" is required`)
      }
    })
  }

  it(`test without token, expected 401`, async () => {
    try {
      await postRequest(resourceRoleUrl, testBody)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'No token provided.')
    }
  })

  it(`test with invalid token(invalid), expected 401`, async () => {
    try {
      await postRequest(resourceRoleUrl, testBody, 'invalid')
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'Invalid Token.')
    }
  })

  it(`test with invalid token(expired), expected 401`, async () => {
    try {
      await postRequest(resourceRoleUrl, testBody, token.expired)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'Failed to authenticate token.')
    }
  })

  it(`test with user token, expected 403`, async () => {
    try {
      await postRequest(resourceRoleUrl, testBody, token.denis)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 403)
      should.equal(_.get(err, 'response.body.message'), 'You are not allowed to perform this action!')
    }
  })

  it(`test with invalid M2M token, expected 403`, async () => {
    try {
      await postRequest(resourceRoleUrl, testBody, token.m2mRead)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 403)
      should.equal(_.get(err, 'response.body.message'), 'You are not allowed to perform this action!')
    }
  })

  it(`create duplicate resource role, expected 409`, async () => {
    const body = resourceRoles.createBody('SUBMITTER', false, true, true)
    try {
      await postRequest(resourceRoleUrl, body, token.admin)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 409)
      should.equal(_.get(err, 'response.body.message'), 'ResourceRole with name: SUBMITTER already exist.')
    }
  })
})
