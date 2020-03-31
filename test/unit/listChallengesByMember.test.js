/**
 * Unit test of ResourceService - list challenges by member.
 */

const should = require('should')
const service = require('../../src/services/ResourceService')
const { assertValidationError, assertError, getRoleIds } = require('../common/testHelper')

const challengeId1 = 'fe6d0a58-ce7d-4521-8501-b8132b1c0391'
const challengeId2 = 'fe6d0a58-ce7d-4521-8501-b8132b1c0392'
const challengeId3 = 'fe6d0a58-ce7d-4521-8501-b8132b1c0393'

module.exports = describe('List challenges by member', () => {
  let submitterRoleId
  let reviewerRoleId
  let observerRoleId

  before(async () => {
    const ret = await getRoleIds()
    submitterRoleId = ret.submitterRoleId
    reviewerRoleId = ret.reviewerRoleId
    observerRoleId = ret.observerRoleId
  })

  it('get challenges hohosky can access', async () => {
    const ret = await service.listChallengesByMember(16096823, {})
    should.equal(ret.length, 1)
    should.equal(ret[0], challengeId1)
  })

  it('get challenges ghostar can access', async () => {
    const ret = await service.listChallengesByMember(151743, {})
    should.equal(ret.length, 3)
    should.equal(ret.includes(challengeId1), true)
    should.equal(ret.includes(challengeId2), true)
    should.equal(ret.includes(challengeId3), true)
  })

  it('get challenges ghostar can access with filter 1', async () => {
    const ret = await service.listChallengesByMember(151743, { resourceRoleId: submitterRoleId })
    should.equal(ret.length, 1)
    should.equal(ret[0], challengeId1)
  })

  it('get challenges ghostar can access with filter 2', async () => {
    const ret = await service.listChallengesByMember(151743, { resourceRoleId: reviewerRoleId })
    should.equal(ret.length, 2)
    should.equal(ret.includes(challengeId2), true)
    should.equal(ret.includes(challengeId3), true)
  })

  it('get challenges ghostar can access with filter 3', async () => {
    const ret = await service.listChallengesByMember(151743, { resourceRoleId: observerRoleId })
    should.equal(ret.length, 0)
  })

  it('failure - get challenges by non existed user', async () => {
    try {
      await service.listChallengesByMember(111111111, {})
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'BadRequestError')
      assertError(err, `User with id: 111111111 doesn't exist`)
    }
  })

  it(`failure - get challenges for user with invalid filter, role doesn't exist`, async () => {
    try {
      await service.listChallengesByMember(151743, { resourceRoleId: challengeId1 })
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'BadRequestError')
      assertError(err, `No resource role found with id: ${challengeId1}.`)
    }
  })

  it(`test invalid parameters, memberId should be number`, async () => {
    try {
      await service.listChallengesByMember('invalid', {})
      throw new Error('should not throw error here')
    } catch (err) {
      assertValidationError(err, `"memberId" must be a number`)
    }
  })

  it(`test invalid parameters, memberId should be positive number`, async () => {
    try {
      await service.listChallengesByMember(-1, {})
      throw new Error('should not throw error here')
    } catch (err) {
      assertValidationError(err, `"memberId" must be a positive number`)
    }
  })

  it(`test invalid parameters, resourceRoleId should be UUID`, async () => {
    try {
      await service.listChallengesByMember(151743, { resourceRoleId: 'invalid' })
      throw new Error('should not throw error here')
    } catch (err) {
      assertValidationError(err, `"resourceRoleId" must be a valid GUID`)
    }
  })
})
