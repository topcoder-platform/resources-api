/**
 * Unit test of ResourceRolePhaseDependencyService - get resource role phase dependencies.
 */

const should = require('should')
const service = require('../../src/services/ResourceRolePhaseDependencyService')
const { assertValidationError, assertResourceRolePhaseDependency, getRoleIds } = require('../common/testHelper')

module.exports = describe('Get resource role phase dependencies', () => {
  let dependency

  before(async () => {
    const ret = await getRoleIds()
    const submitterRoleId = ret.submitterRoleId
    const records = await service.getDependencies({ resourceRoleId: submitterRoleId })
    dependency = records[0]
  })

  it('get all resource role phase dependencies', async () => {
    const records = await service.getDependencies({})
    should.equal(records.length, 2)
    for (const record of records) {
      await assertResourceRolePhaseDependency(record.id, record)
    }
  })

  it('get single resource role phase dependency', async () => {
    const records = await service.getDependencies({
      phaseId: dependency.phaseId,
      resourceRoleId: dependency.resourceRoleId,
      phaseState: dependency.phaseState
    })
    should.equal(records.length, 1)
    for (const record of records) {
      await assertResourceRolePhaseDependency(record.id, record)
    }
  })

  it('test invalid parameters, invalid boolean parameter phaseState', async () => {
    try {
      await service.getDependencies({ phaseState: 'invalid' })
      throw new Error('should not throw error here')
    } catch (err) {
      assertValidationError(err, `"phaseState" must be a boolean`)
    }
  })

  it('test invalid parameters, invalid GUID parameter phaseId', async () => {
    try {
      await service.getDependencies({ phaseId: 'invalid' })
      throw new Error('should not throw error here')
    } catch (err) {
      assertValidationError(err, `"phaseId" must be a valid GUID`)
    }
  })

  it('test invalid parameters, unexpected query parameter', async () => {
    try {
      await service.getDependencies({ other: 'invalid' })
      throw new Error('should not throw error here')
    } catch (err) {
      assertValidationError(err, '"other" is not allowed')
    }
  })
})
