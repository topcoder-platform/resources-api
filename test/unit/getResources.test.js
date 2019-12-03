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
    } else {
      should.equal(entity.roleId, submitterRoleId)
    }
    should.exist(expected.created)
    should.exist(expected.createdBy)
    should.equal(entity.createdBy, expected.createdBy)
  }

  it('get resources by admin', async () => {
    hasCopilotRole = false
    hasReviewerRole = false
    const records = await service.getResources(user.admin, challengeId)
    should.equal(records.length, 5)
    for (const record of records) {
      await assertResource(record.id, record)
    }
    // user hohosky should have two resources
    should.equal(hasCopilotRole, true)
    should.equal(hasReviewerRole, true)
  })

  it('get resources by user has full-access permission', async () => {
    hasCopilotRole = false
    hasReviewerRole = false
    const records = await service.getResources(user.hohosky, challengeId)
    should.equal(records.length, 5)
    for (const record of records) {
      await assertResource(record.id, record)
    }
    // user hohosky should have two resources
    should.equal(hasCopilotRole, true)
    should.equal(hasReviewerRole, true)
  })

  it('get resources using m2m token', async () => {
    hasCopilotRole = false
    hasReviewerRole = false
    const records = await service.getResources(user.m2m, challengeId)
    should.equal(records.length, 5)
    for (const record of records) {
      await assertResource(record.id, record)
    }
    // user hohosky should have two resources
    should.equal(hasCopilotRole, true)
    should.equal(hasReviewerRole, true)
  })

  it(`test invalid parameter, challengeId must be UUID`, async () => {
    try {
      await service.getResources(user.m2m, 'invalid')
      throw new Error('should not throw error here')
    } catch (err) {
      assertValidationError(err, `"challengeId" must be a valid GUID`)
    }
  })

  it(`failure - get resources using user without permission`, async () => {
    try {
      await service.getResources(user.denis, challengeId)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'ForbiddenError')
      assertError(err, `Only M2M, admin or user with full access role can perform this action`)
    }
  })

  it('failure - get resource from non-existed challenge', async () => {
    try {
      await service.getResources(user.m2m, challengeNotFoundId)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 404)
      should.equal(err.response.body.message, `Challenge with id: ${challengeNotFoundId} doesn't exist.`)
    }
  })
})
