/**
 * Unit test of ResourceService - delete resource.
 */

const _ = require('lodash')
const should = require('should')
const service = require('../../src/services/ResourceService')
const helper = require('../../src/common/helper')
const { requestBody, user } = require('../common/testData')
const { assertValidationError, assertError, getRoleIds } = require('../common/testHelper')

const challengeId = 'fe6d0a58-ce7d-4521-8501-b8132b1c0391'
const challengeNotFoundId = '11111111-ce7d-4521-8501-b8132b1c0391'
const resources = requestBody.resources

module.exports = describe('Delete resource', () => {
  let copilotRoleId
  let observerRoleId
  let submitterRoleId

  before(async () => {
    const ret = await getRoleIds()
    copilotRoleId = ret.copilotRoleId
    observerRoleId = ret.observerRoleId
    submitterRoleId = ret.submitterRoleId
  })

  it(`failure - delete resource that user doesn't have`, async () => {
    const entity = resources.createBody('HoHosky', observerRoleId, challengeId)
    try {
      await service.deleteResource(user.m2m, entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'BadRequestError')
      assertError(err, `User hohosky doesn't have resource with roleId: ${observerRoleId} in challenge ${challengeId}`)
    }
  })

  it('failure - delete resource using non-existed role', async () => {
    const entity = resources.createBody('ghostar', challengeId, challengeId)
    try {
      await service.deleteResource(user.m2m, entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'BadRequestError')
      assertError(err, `No resource role found with id: ${challengeId}.`)
    }
  })

  it(`failure - delete resource member doesn't exist`, async () => {
    const entity = resources.createBody('123abcx', observerRoleId, challengeId)
    try {
      await service.deleteResource(user.m2m, entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'BadRequestError')
      assertError(err, `User with handle: 123abcx doesn't exist`)
    }
  })

  let { stringFields, requiredFields, testBody } = resources

  it(`test invalid parameter, challengeId must be UUID`, async () => {
    let entity = _.cloneDeep(testBody)
    entity.challengeId = 'invalid'
    try {
      await service.deleteResource(user.m2m, entity)
      throw new Error('should not throw error here')
    } catch (err) {
      assertValidationError(err, `"challengeId" must be a valid GUID`)
    }
  })

  for (const stringField of stringFields) {
    it(`test invalid parameters, invalid string type field ${stringField}`, async () => {
      let entity = _.cloneDeep(testBody)
      _.set(entity, stringField, 123)
      try {
        await service.deleteResource(user.m2m, entity)
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, `"${stringField}" must be a string`)
      }
    })
  }

  for (const requiredField of requiredFields) {
    it(`test invalid parameters, required field ${requiredField} is missing`, async () => {
      let entity = _.cloneDeep(testBody)
      entity = _.omit(entity, requiredField)
      try {
        await service.deleteResource(user.m2m, entity)
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, `"${requiredField}" is required`)
      }
    })
  }

  it(`failure - delete resource with user without permission`, async () => {
    const entity = resources.createBody('tonyj', submitterRoleId, challengeId)
    try {
      await service.deleteResource(user.denis, entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'ForbiddenError')
      assertError(err, 'Only M2M, admin or user with full access role can perform this action')
    }
  })

  it('failure - delete resource for non-existed challenge', async () => {
    const entity = resources.createBody('ghostar', observerRoleId, challengeNotFoundId)
    try {
      await service.deleteResource(user.admin, entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 404)
      should.equal(err.response.body.message, `Challenge with id: ${challengeNotFoundId} doesn't exist.`)
    }
  })

  it('delete resource using m2m', async () => {
    const data = resources.createBody('ghostar', submitterRoleId, challengeId)
    const ret = await service.deleteResource(user.m2m, data)
    should.exist(ret.id)
    try {
      await helper.getById('Resource', ret.id)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'NotFoundError')
    }
    should.equal(ret.challengeId, challengeId)
    should.exist(ret.memberId)
    should.equal(ret.memberHandle.toLowerCase(), 'ghostar')
    should.equal(ret.roleId, submitterRoleId)
    should.exist(ret.created)
    should.equal(ret.createdBy, user.m2m.sub)
  })

  it('delete resource by user', async () => {
    const data = resources.createBody('DENIS', submitterRoleId, challengeId)
    const ret = await service.deleteResource(user.hohosky, data)
    should.exist(ret.id)
    try {
      await helper.getById('Resource', ret.id)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'NotFoundError')
    }
    should.equal(ret.challengeId, challengeId)
    should.exist(ret.memberId)
    should.equal(ret.memberHandle.toLowerCase(), 'denis')
    should.equal(ret.roleId, submitterRoleId)
    should.exist(ret.created)
    should.equal(ret.createdBy.toLowerCase(), 'hohosky')
  })

  it('delete resource by admin', async () => {
    const data = resources.createBody('HoHoSKY', copilotRoleId, challengeId)
    const ret = await service.deleteResource(user.admin, data)
    should.exist(ret.id)
    try {
      await helper.getById('Resource', ret.id)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'NotFoundError')
    }
    should.equal(ret.challengeId, challengeId)
    should.exist(ret.memberId)
    should.equal(ret.memberHandle.toLowerCase(), 'hohosky')
    should.equal(ret.roleId, copilotRoleId)
    should.exist(ret.created)
    should.equal(ret.createdBy.toLowerCase(), 'tonyj')
  })
})
