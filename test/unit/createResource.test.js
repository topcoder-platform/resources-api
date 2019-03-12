/**
 * Unit test of ResourceService - create resource.
 */

const _ = require('lodash')
const should = require('should')
const service = require('../../src/services/ResourceService')
const { requestBody, user } = require('../common/testData')
const { assertValidationError, assertError, assertResource, getRoleIds } = require('../common/testHelper')

const challengeId = 'fe6d0a58-ce7d-4521-8501-b8132b1c0391'
const challengeNotFoundId = '11111111-ce7d-4521-8501-b8132b1c0391'
const resources = requestBody.resources

module.exports = describe('Create resource', () => {
  let copilotRoleId
  let observerRoleId
  let submitterRoleId

  before(async () => {
    const ret = await getRoleIds()
    copilotRoleId = ret.copilotRoleId
    observerRoleId = ret.observerRoleId
    submitterRoleId = ret.submitterRoleId
  })

  it('create resource by admin', async () => {
    const entity = resources.createBody('HoHoSKY', copilotRoleId)
    const ret = await service.createResource(user.admin, challengeId, entity)
    should.equal(ret.roleId, entity.roleId)
    should.equal(ret.memberHandle.toLowerCase(), entity.memberHandle.toLowerCase())
    await assertResource(ret.id, ret)
  })

  it('create resource by user', async () => {
    const entity = resources.createBody('denis', submitterRoleId)
    const ret = await service.createResource(user.hohosky, challengeId, entity)
    should.equal(ret.roleId, entity.roleId)
    should.equal(ret.memberHandle.toLowerCase(), entity.memberHandle.toLowerCase())
    await assertResource(ret.id, ret)
  })

  it('create resource using m2m token', async () => {
    const entity = resources.createBody('ghostar', submitterRoleId)
    const ret = await service.createResource(user.m2m, challengeId, entity)
    should.equal(ret.roleId, entity.roleId)
    should.equal(ret.memberHandle.toLowerCase(), entity.memberHandle.toLowerCase())
    await assertResource(ret.id, ret)
  })

  it('failure - create resource using inactive role', async () => {
    const entity = resources.createBody('ghostar', observerRoleId)
    try {
      await service.createResource(user.m2m, challengeId, entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'BadRequestError')
      assertError(err, `Resource role with id: ${observerRoleId} is inactive, please use an active one.`)
    }
  })

  it('failure - create resource using non-existed role', async () => {
    const entity = resources.createBody('ghostar', challengeId)
    try {
      await service.createResource(user.m2m, challengeId, entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'BadRequestError')
      assertError(err, `No resource role found with id: ${challengeId}.`)
    }
  })

  it(`failure - create resource member doesn't exist`, async () => {
    const entity = resources.createBody('123abcx', observerRoleId)
    try {
      await service.createResource(user.m2m, challengeId, entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'BadRequestError')
      assertError(err, `User with handle: 123abcx doesn't exist`)
    }
  })

  let { stringFields, requiredFields, testBody } = resources

  it(`test invalid parameters, challengeId must be UUID`, async () => {
    try {
      await service.createResource(user.m2m, 'invalid', testBody)
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
        await service.createResource(user.m2m, challengeId, entity)
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
        await service.createResource(user.m2m, challengeId, entity)
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, `"${requiredField}" is required`)
      }
    })
  }

  it('failure - create resource for non-existed challenge', async () => {
    const entity = resources.createBody('ghostar', observerRoleId)
    try {
      await service.createResource(user.m2m, challengeNotFoundId, entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 404)
      should.equal(err.response.body.message, `Challenge with id: ${challengeNotFoundId} doesn't exist.`)
    }
  })

  it('failure - create duplicate resource', async () => {
    const entity = resources.createBody('hohosky', copilotRoleId)
    try {
      await service.createResource(user.m2m, challengeId, entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'ConflictError')
      assertError(err, `User hohosky already has resource with roleId: ${copilotRoleId} in challenge: ${challengeId}`)
    }
  })
})
