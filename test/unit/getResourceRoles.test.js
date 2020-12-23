/**
 * Unit test of ResourceRoleService - get resource roles.
 */

const should = require('should')
const service = require('../../src/services/ResourceRoleService')
const { assertValidationError, assertResourceRole } = require('../common/testHelper')

module.exports = describe('Get resource role', () => {
  let inactiveId

  it('get all resource roles', async () => {
    const records = await service.getResourceRoles({})
    should.equal(records.length, 4)
    for (const record of records) {
      await assertResourceRole(record.id, record)
    }
  })

  it('get active resource roles', async () => {
    const records = await service.getResourceRoles({ isActive: true })
    should.equal(records.length, 3)
    for (const record of records) {
      should.equal(record.isActive, true)
      await assertResourceRole(record.id, record)
    }
  })

  it('get inactive resource roles', async () => {
    const records = await service.getResourceRoles({ isActive: false })
    should.equal(records.length, 1)
    should.equal(records[0].isActive, false)
    await assertResourceRole(records[0].id, records[0])
    inactiveId = records[0].id
  })

  it('search resource roles with filter', async () => {
    const records = await service.getResourceRoles({
      name: 'Observer',
      id: inactiveId,
      legacyId: 1,
      selfObtainable: false,
      fullReadAccess: true,
      fullWriteAccess: false
    })
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
      await service.getResourceRoles({ isActive: 'invalid' })
      throw new Error('should not throw error here')
    } catch (err) {
      assertValidationError(err, `"isActive" must be a boolean`)
    }
  })
})
