/**
 * Unit test of ResourceService - create resource.
 */

const _ = require('lodash')
const should = require('should')
const service = require('../../src/services/ResourceService')
const { requestBody, user } = require('../common/testData')
const { assertValidationError, assertError, assertResource, getRoleIds } = require('../common/testHelper')

const challengeId1 = 'fe6d0a58-ce7d-4521-8501-b8132b1c0391'
const challengeId2 = 'fe6d0a58-ce7d-4521-8501-b8132b1c0392'
const challengeId3 = 'fe6d0a58-ce7d-4521-8501-b8132b1c0393'
const challengeNotFoundId = '11111111-ce7d-4521-8501-b8132b1c0391'
const resources = requestBody.resources

module.exports = describe('Create resource', () => {
  let copilotRoleId
  let observerRoleId
  let submitterRoleId
  let reviewerRoleId

  before(async () => {
    const ret = await getRoleIds()
    copilotRoleId = ret.copilotRoleId
    observerRoleId = ret.observerRoleId
    submitterRoleId = ret.submitterRoleId
    reviewerRoleId = ret.reviewerRoleId
  })

  it('create resource by admin', async () => {
    const entity = resources.createBody('HoHoSKY', copilotRoleId, challengeId1)
    const ret = await service.createResource(user.admin, entity)
    should.equal(ret.roleId, entity.roleId)
    should.equal(ret.memberHandle.toLowerCase(), entity.memberHandle.toLowerCase())
    await assertResource(ret.id, ret)
  })

  it('create another resource for user hohosky', async () => {
    const entity = resources.createBody('HoHoSKY', reviewerRoleId, challengeId1)
    const ret = await service.createResource(user.admin, entity)
    should.equal(ret.roleId, entity.roleId)
    should.equal(ret.memberHandle.toLowerCase(), entity.memberHandle.toLowerCase())
    await assertResource(ret.id, ret)
  })

  it('create resource by user', async () => {
    const entity = resources.createBody('denis', submitterRoleId, challengeId1)
    const ret = await service.createResource(user.hohosky, entity)
    should.equal(ret.roleId, entity.roleId)
    should.equal(ret.memberHandle.toLowerCase(), entity.memberHandle.toLowerCase())
    await assertResource(ret.id, ret)
  })

  it('create resource using m2m token', async () => {
    const entity = resources.createBody('ghostar', submitterRoleId, challengeId1)
    const ret = await service.createResource(user.m2m, entity)
    should.equal(ret.roleId, entity.roleId)
    should.equal(ret.memberHandle.toLowerCase(), entity.memberHandle.toLowerCase())
    await assertResource(ret.id, ret)
  })

  it('create resource for user ghostar 1', async () => {
    const entity = resources.createBody('ghostar', reviewerRoleId, challengeId2)
    const ret = await service.createResource(user.m2m, entity)
    should.equal(ret.roleId, entity.roleId)
    should.equal(ret.memberHandle.toLowerCase(), entity.memberHandle.toLowerCase())
    await assertResource(ret.id, ret)
  })

  it('create resource for user ghostar 2', async () => {
    const entity = resources.createBody('ghostar', reviewerRoleId, challengeId3)
    const ret = await service.createResource(user.m2m, entity)
    should.equal(ret.roleId, entity.roleId)
    should.equal(ret.memberHandle.toLowerCase(), entity.memberHandle.toLowerCase())
    await assertResource(ret.id, ret)
  })

  it('failure - create resource using inactive role', async () => {
    const entity = resources.createBody('ghostar', observerRoleId, challengeId1)
    try {
      await service.createResource(user.m2m, entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'BadRequestError')
      assertError(err, `Resource role with id: ${observerRoleId} is inactive, please use an active one.`)
    }
  })

  it('failure - create resource using non-existed role', async () => {
    const entity = resources.createBody('ghostar', challengeId1, challengeId1)
    try {
      await service.createResource(user.m2m, entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'BadRequestError')
      assertError(err, `No resource role found with id: ${challengeId1}.`)
    }
  })

  it(`failure - create resource member doesn't exist`, async () => {
    const entity = resources.createBody('123abcx', observerRoleId, challengeId1)
    try {
      await service.createResource(user.m2m, entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'BadRequestError')
      assertError(err, `User with handle: 123abcx doesn't exist`)
    }
  })

  let { stringFields, requiredFields, testBody } = resources

  it(`test invalid parameters, challengeId must be UUID`, async () => {
    try {
      let entity = _.cloneDeep(testBody)
      entity.challengeId = 'invalid'
      await service.createResource(user.m2m, entity)
      throw new Error('should not throw error here')
    } catch (err) {
      assertValidationError(err, '"challengeId" must be a valid GUID')
    }
  })

  for (const stringField of stringFields) {
    it(`test invalid parameters, invalid string type field ${stringField}`, async () => {
      let entity = _.cloneDeep(testBody)
      _.set(entity, stringField, 123)
      try {
        await service.createResource(user.m2m, entity)
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
        await service.createResource(user.m2m, entity)
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, `"${requiredField}" is required`)
      }
    })
  }

  it('failure - create resource for non-existed challenge', async () => {
    const entity = resources.createBody('ghostar', observerRoleId, challengeNotFoundId)
    try {
      await service.createResource(user.m2m, entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 404)
      should.equal(err.response.body.message, `Challenge with id: ${challengeNotFoundId} doesn't exist.`)
    }
  })

  it('failure - create duplicate resource', async () => {
    const entity = resources.createBody('hohosky', copilotRoleId, challengeId1)
    try {
      await service.createResource(user.m2m, entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'ConflictError')
      assertError(err, `User hohosky already has resource with roleId: ${copilotRoleId} in challenge: ${challengeId1}`)
    }
  })
})
