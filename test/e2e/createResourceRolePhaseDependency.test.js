/**
 * E2E test of the Challenge Resource API - create resource role phase dependency endpoint.
 */

const _ = require('lodash')
const config = require('config')
const should = require('should')
const { postRequest, assertResourceRolePhaseDependency, getRoleIds } = require('../common/testHelper')
const { token, requestBody } = require('../common/testData')

const dependenciesUrl = `http://localhost:${config.PORT}/${config.API_VERSION}/resource-roles/phase-dependencies`
const dependencies = requestBody.resourceRolePhaseDependencies

module.exports = describe('Create resource role phase dependency endpoint', () => {
  let copilotRoleId
  let submitterRoleId
  let observerRoleId

  before(async () => {
    const ret = await getRoleIds()
    copilotRoleId = ret.copilotRoleId
    submitterRoleId = ret.submitterRoleId
    observerRoleId = ret.observerRoleId
  })

  it('create copilot dependency', async () => {
    const entity = dependencies.createBody(dependencies.testBody.phaseId, copilotRoleId, true)
    const ret = await postRequest(dependenciesUrl, entity, token.admin)
    should.equal(ret.status, 200)
    await assertResourceRolePhaseDependency(ret.body.id, entity)
  })

  it('create submitter dependency', async () => {
    const entity = dependencies.createBody(dependencies.testBody.phaseId, submitterRoleId, true)
    const ret = await postRequest(dependenciesUrl, entity, token.m2m)
    should.equal(ret.status, 200)
    await assertResourceRolePhaseDependency(ret.body.id, entity)
  })

  it('create dependency - resource role is inactive', async () => {
    try {
      const entity = dependencies.createBody(dependencies.testBody.phaseId, observerRoleId, true)
      await postRequest(dependenciesUrl, entity, token.m2m)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 400)
      should.equal(_.get(err, 'response.body.message'), `Resource role with id: ${observerRoleId} is inactive`)
    }
  })

  it('create dependency - phaseId not found', async () => {
    try {
      const entity = dependencies.createBody(submitterRoleId, submitterRoleId, false)
      await postRequest(dependenciesUrl, entity, token.admin)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 404)
      should.equal(_.get(err, 'response.body.message'), `Not found phase id: ${submitterRoleId}`)
    }
  })

  it('create dependency - resourceRoleId not found', async () => {
    try {
      const entity = dependencies.createBody(dependencies.testBody.phaseId, dependencies.testBody.phaseId, true)
      await postRequest(dependenciesUrl, entity, token.admin)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 404)
      should.equal(_.get(err, 'response.body.message'), `ResourceRole with id: ${dependencies.testBody.phaseId} doesn't exist`)
    }
  })

  it('create dependency - conflict', async () => {
    const entity = dependencies.createBody(dependencies.testBody.phaseId, submitterRoleId, true)
    try {
      await postRequest(dependenciesUrl, entity, token.admin)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 409)
      should.equal(_.get(err, 'response.body.message'), 'There is already dependency of given phaseId and resourceRoleId')
    }
  })

  let { stringFields, booleanFields, requiredFields, testBody } = dependencies

  for (const stringField of stringFields) {
    it(`test invalid parameters, invalid string type field ${stringField}`, async () => {
      let entity = _.cloneDeep(testBody)
      _.set(entity, stringField, 123)
      try {
        await postRequest(dependenciesUrl, entity, token.admin)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 400)
        should.equal(_.get(err, 'response.body.message'), `"${stringField}" must be a string`)
      }
    })
  }

  for (const booleanField of booleanFields) {
    it(`test invalid parameters, invalid boolean type field ${booleanField}`, async () => {
      let entity = _.cloneDeep(testBody)
      _.set(entity, booleanField, 123)
      try {
        await postRequest(dependenciesUrl, entity, token.admin)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 400)
        should.equal(_.get(err, 'response.body.message'), `"${booleanField}" must be a boolean`)
      }
    })
  }

  for (const requiredField of requiredFields) {
    it(`test invalid parameters, required field ${requiredField} is missing`, async () => {
      let entity = _.cloneDeep(testBody)
      entity = _.omit(entity, requiredField)
      try {
        await postRequest(dependenciesUrl, entity, token.admin)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 400)
        should.equal(_.get(err, 'response.body.message'), `"${requiredField}" is required`)
      }
    })
  }

  it(`test without token, expected 401`, async () => {
    try {
      await postRequest(dependenciesUrl, testBody)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'No token provided.')
    }
  })

  it(`test with invalid token(invalid), expected 401`, async () => {
    try {
      await postRequest(dependenciesUrl, testBody, 'invalid')
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'Invalid Token.')
    }
  })

  it(`test with invalid token(expired), expected 401`, async () => {
    try {
      await postRequest(dependenciesUrl, testBody, token.expired)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'Failed to authenticate token.')
    }
  })

  it(`test with user token, expected 403`, async () => {
    try {
      await postRequest(dependenciesUrl, testBody, token.denis)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 403)
      should.equal(_.get(err, 'response.body.message'), 'You are not allowed to perform this action!')
    }
  })

  it(`test with invalid M2M token, expected 403`, async () => {
    try {
      await postRequest(dependenciesUrl, testBody, token.m2mRead)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 403)
      should.equal(_.get(err, 'response.body.message'), 'You are not allowed to perform this action!')
    }
  })
})
