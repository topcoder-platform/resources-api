/**
 * Unit test of ResourceService - get resources.
 */

const should = require('should')
const service = require('../../src/services/ResourceService')
const helper = require('../../src/common/helper')
const { user } = require('../common/testData')
const { assertValidationError, assertError, getRoleIds } = require('../common/testHelper')

const challengeId = 'fe6d0a58-ce7d-4521-8501-b8132b1c0391'
const challengeNotFoundId = '11111111-ce7d-4521-8501-b8132b1c0391'

module.exports = describe('Get resources', () => {
  let copilotRoleId
  let submitterRoleId
  let reviewerRoleId

  before(async () => {
    const ret = await getRoleIds()
    copilotRoleId = ret.copilotRoleId
    submitterRoleId = ret.submitterRoleId
    reviewerRoleId = ret.reviewerRoleId
  })

  let hasCopilotRole, hasReviewerRole

  /**
   * Assert resource entity in database.
   * @param {String} id the entity id
   * @param {Object} expected the expected data
   */
  const assertResource = async (id, expected) => {
    should.exist(id)
    const entity = await helper.getById('Resource', id)
    should.equal(entity.challengeId, challengeId)
    should.equal(entity.memberId, expected.memberId)
    should.equal(entity.memberHandle.toLowerCase(), expected.memberHandle.toLowerCase())
    should.equal(entity.roleId, expected.roleId)
    if (entity.memberHandle.toLowerCase() === 'hohosky') {
      if (entity.roleId === copilotRoleId) {
        hasCopilotRole = true
      }
      if (entity.roleId === reviewerRoleId) {
        hasReviewerRole = true
      }
      should.equal(expected.rating, 2000)
    } else {
      if (entity.memberHandle.toLowerCase() === 'denis') {
        should.equal(expected.rating, 0)
      }
      should.equal(entity.roleId, submitterRoleId)
    }
    should.exist(expected.created)
    should.exist(expected.createdBy)
    should.equal(entity.createdBy, expected.createdBy)
  }

  it('get resources by admin', async () => {
    hasCopilotRole = false
    hasReviewerRole = false
    const result = await service.getResources(user.admin, challengeId)
    should.equal(result.total, 5)
    for (const record of result.data) {
      await assertResource(record.id, record)
    }
    // user hohosky should have two resources
    should.equal(hasCopilotRole, true)
    should.equal(hasReviewerRole, true)
  })

  it('get resources by user has full-access permission', async () => {
    hasCopilotRole = false
    hasReviewerRole = false
    const result = await service.getResources(user.hohosky, challengeId)
    should.equal(result.total, 5)
    for (const record of result.data) {
      await assertResource(record.id, record)
    }
    // user hohosky should have two resources
    should.equal(hasCopilotRole, true)
    should.equal(hasReviewerRole, true)
  })

  it(`get resources using user without permission`, async () => {
    const result = await service.getResources(user.denis, challengeId)
    should.equal(result.total, 1)
    should.equal(result.data[0].memberHandle, 'denis')
  })

  it('get resources using m2m token', async () => {
    hasCopilotRole = false
    hasReviewerRole = false
    const result = await service.getResources(user.m2m, challengeId)
    should.equal(result.total, 5)
    for (const record of result.data) {
      await assertResource(record.id, record)
    }
    // user hohosky should have two resources
    should.equal(hasCopilotRole, true)
    should.equal(hasReviewerRole, true)
  })

  it('get resources with role id using m2m token', async () => {
    hasCopilotRole = false
    hasReviewerRole = false
    const result = await service.getResources(user.m2m, challengeId, copilotRoleId)
    should.equal(result.total, 1)
    for (const record of result.data) {
      await assertResource(record.id, record)
    }
    // user hohosky should have copilot role
    should.equal(hasCopilotRole, true)
  })

  it('get resources without user login', async () => {
    const result = await service.getResources(null, challengeId)
    should.equal(result.total, 0)
  })

  it(`test invalid parameter, challengeId must be UUID`, async () => {
    try {
      await service.getResources(user.m2m, 'invalid')
      throw new Error('should not throw error here')
    } catch (err) {
      assertValidationError(err, `"challengeId" must be a valid GUID`)
    }
  })

  it('failure - get resource from non-existed challenge', async () => {
    try {
      await service.getResources(user.m2m, challengeNotFoundId)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'NotFoundError')
      assertError(err, `Challenge ID ${challengeNotFoundId} not found`)
    }
  })
})
