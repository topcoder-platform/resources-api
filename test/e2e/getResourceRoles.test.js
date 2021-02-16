/**
 * E2E test of the Challenge Resource API - get resource roles endpoint.
 */

const _ = require('lodash')
const config = require('config')
const should = require('should')
const { getRequest, assertResourceRole } = require('../common/testHelper')
const { token } = require('../common/testData')

const resourceRoleUrl = `http://localhost:${config.PORT}/${config.API_VERSION}/resource-roles`

module.exports = describe('Get resource roles endpoint', () => {
  let inactiveId

  it('get all resource roles', async () => {
    const res = await getRequest(resourceRoleUrl, token.admin)
    should.equal(res.status, 200)
    const records = res.body
    should.equal(records.length, 4)
    for (const record of records) {
      await assertResourceRole(record.id, record)
    }
  })

  it('get active resource roles', async () => {
    const res = await getRequest(`${resourceRoleUrl}?isActive=true`, token.admin)
    should.equal(res.status, 200)
    const records = res.body
    should.equal(records.length, 3)
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
    inactiveId = records[0].id
  })

  it('search resource roles with filter', async () => {
    const res = await getRequest(`${resourceRoleUrl}?name=Observer&id=${inactiveId}&legacyId=1&selfObtainable=false&fullReadAccess=true&fullWriteAccess=false`, token.admin)
    should.equal(res.status, 200)
    const records = res.body
    should.equal(records.length, 1)
    should.equal(records[0].id, inactiveId)
    should.equal(records[0].name, 'Observer')
    should.equal(records[0].fullReadAccess, true)
    should.equal(records[0].fullWriteAccess, false)
    should.equal(records[0].selfObtainable, false)
    should.equal(records[0].legacyId, 1)
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
})
