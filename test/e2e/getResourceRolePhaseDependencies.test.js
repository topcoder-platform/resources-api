/**
 * E2E test of the Challenge Resource API - get resource role phase dependencies endpoint.
 */

const _ = require('lodash')
const config = require('config')
const should = require('should')
const service = require('../../src/services/ResourceRolePhaseDependencyService')
const { getRequest, assertResourceRolePhaseDependency, getRoleIds } = require('../common/testHelper')
const { token } = require('../common/testData')

const dependenciesUrl = `http://localhost:${config.PORT}/${config.API_VERSION}/resource-roles/phase-dependencies`

module.exports = describe('Get resource roles endpoint', () => {
  let dependency

  before(async () => {
    const ret = await getRoleIds()
    const submitterRoleId = ret.submitterRoleId
    const records = await service.getDependencies({ resourceRoleId: submitterRoleId })
    dependency = records[0]
  })

  it('get all resource role phase dependencies', async () => {
    const res = await getRequest(dependenciesUrl, token.admin)
    should.equal(res.status, 200)
    const records = res.body
    should.equal(records.length, 2)
    for (const record of records) {
      await assertResourceRolePhaseDependency(record.id, record)
    }
  })

  it('get matched resource role phase dependencies', async () => {
    const res = await getRequest(`${dependenciesUrl}?phaseId=${dependency.phaseId}&resourceRoleId=${
      dependency.resourceRoleId
    }&phaseState=${dependency.phaseState}`, token.m2mRead)
    should.equal(res.status, 200)
    const records = res.body
    should.equal(records.length, 1)
    for (const record of records) {
      await assertResourceRolePhaseDependency(record.id, record)
    }
  })

  it('test invalid parameters, invalid boolean parameter phaseState ', async () => {
    try {
      await getRequest(`${dependenciesUrl}?phaseState=invalid`, token.admin)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 400)
      should.equal(_.get(err, 'response.body.message'), `"phaseState" must be a boolean`)
    }
  })

  it('test invalid parameters, invalid GUID parameter phaseId ', async () => {
    try {
      await getRequest(`${dependenciesUrl}?phaseId=invalid`, token.admin)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 400)
      should.equal(_.get(err, 'response.body.message'), `"phaseId" must be a valid GUID`)
    }
  })

  it(`test without token, expected 401`, async () => {
    try {
      await getRequest(dependenciesUrl)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'No token provided.')
    }
  })

  it(`test with invalid token(invalid), expected 401`, async () => {
    try {
      await getRequest(dependenciesUrl, 'invalid')
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'Invalid Token.')
    }
  })

  it(`test with invalid token(expired), expected 401`, async () => {
    try {
      await getRequest(dependenciesUrl, token.expired)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'Failed to authenticate token.')
    }
  })

  it(`test with invalid M2M token, expected 403`, async () => {
    try {
      await getRequest(dependenciesUrl, token.m2mModify)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 403)
      should.equal(_.get(err, 'response.body.message'), 'You are not allowed to perform this action!')
    }
  })
})
