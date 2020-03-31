/**
 * Unit test of ResourceRolePhaseDependencyService - delete resource role phase dependency.
 */

const should = require('should')
const service = require('../../src/services/ResourceRolePhaseDependencyService')
const { assertError, getRoleIds } = require('../common/testHelper')

module.exports = describe('Delete resource role phase dependency', () => {
  let dependency

  before(async () => {
    const ret = await getRoleIds()
    const submitterRoleId = ret.submitterRoleId
    const records = await service.getDependencies({ resourceRoleId: submitterRoleId })
    dependency = records[0]
  })

  it('delete dependency', async () => {
    const ret = await service.deleteDependency(dependency.id)
    should.equal(ret.id, dependency.id)
    should.equal(ret.phaseId, dependency.phaseId)
    should.equal(ret.resourceRoleId, dependency.resourceRoleId)
    should.equal(ret.phaseState, dependency.phaseState)
  })

  it('delete dependency - not found', async () => {
    try {
      await service.deleteDependency(dependency.id)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'NotFoundError')
      assertError(err, `ResourceRolePhaseDependency with id: ${dependency.id} doesn't exist`)
    }
  })

  it('delete dependency - invalid id', async () => {
    try {
      await service.deleteDependency('invalid')
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'ValidationError')
      assertError(err, '"id" must be a valid GUID')
    }
  })

  it('delete dependency - empty id', async () => {
    try {
      await service.deleteDependency('')
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'ValidationError')
      assertError(err, '"id" is not allowed to be empty')
    }
  })
})
