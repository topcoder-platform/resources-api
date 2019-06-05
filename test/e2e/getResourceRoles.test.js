/**
 * E2E test of the Challenge Resource API - get resource roles endpoint.
 */

const _ = require('lodash')
const config = require('config')
const should = require('should')
const { getRequest, assertResourceRole } = require('../common/testHelper')
const { token } = require('../common/testData')

const resourceRoleUrl = `http://localhost:${config.PORT}/resourceRoles`

module.exports = describe('Get resource roles endpoint', () => {
  it('get all resource roles', async () => {
    const res = await getRequest(resourceRoleUrl, token.admin)
    should.equal(res.status, 200)
    const records = res.body
    should.equal(records.length, 3)
    for (const record of records) {
      await assertResourceRole(record.id, record)
    }
  })

  it('get active resource roles', async () => {
    const res = await getRequest(`${resourceRoleUrl}?isActive=true`, token.admin)
    should.equal(res.status, 200)
    const records = res.body
    should.equal(records.length, 2)
    for (const record of records) {
      should.equal(record.isActive, true)
      await assertResourceRole(record.id, record)
    }
  })

  it('get inactive resource roles', async () => {
    const res = await getRequest(`${resourceRoleUrl}?isActive=false`, token.denis)
    should.equal(res.status, 200)
    const records = res.body
    should.equal(records.length, 1)
    should.equal(records[0].isActive, false)
    await assertResourceRole(records[0].id, records[0])
  })

  it('test invalid parameters, invalid boolean path parameter isActive ', async () => {
    try {
      await getRequest(`${resourceRoleUrl}?isActive=invalid`, token.denis)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 400)
      should.equal(_.get(err, 'response.body.message'), `"isActive" must be a boolean`)
    }
  })

  it(`test without token, expected 401`, async () => {
    try {
      await getRequest(resourceRoleUrl)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'No token provided.')
    }
  })

  it(`test with invalid token(invalid), expected 401`, async () => {
    try {
      await getRequest(resourceRoleUrl, 'invalid')
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'Invalid Token.')
    }
  })

  it(`test with invalid token(expired), expected 401`, async () => {
    try {
      await getRequest(resourceRoleUrl, token.expired)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 401)
      should.equal(_.get(err, 'response.body.message'), 'Failed to authenticate token.')
    }
  })

  it(`test with invalid M2M token, expected 403`, async () => {
    try {
      await getRequest(resourceRoleUrl, token.m2mModify)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 403)
      should.equal(_.get(err, 'response.body.message'), 'You are not allowed to perform this action!')
    }
  })
})
