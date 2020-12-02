/**
 * Unit test of ResourceRolePhaseDependencyService - create resource role phase dependency.
 */

const _ = require('lodash')
const should = require('should')
const service = require('../../src/services/ResourceRolePhaseDependencyService')
const { requestBody } = require('../common/testData')
const { assertValidationError, assertError, assertResourceRolePhaseDependency, getRoleIds } = require('../common/testHelper')

const dependencies = requestBody.resourceRolePhaseDependencies

module.exports = describe('Create resource role phase dependency', () => {
  let copilotRoleId
  let submitterRoleId
  let observerRoleId

  before(async () => {
    const ret = await getRoleIds()
    copilotRoleId = ret.copilotRoleId
    submitterRoleId = ret.submitterRoleId
    observerRoleId = ret.observerRoleId
  })

  it('create copilot dependency', async () => {
    const entity = dependencies.createBody(dependencies.testBody.phaseId, copilotRoleId, true)
    const ret = await service.createDependency(entity)
    await assertResourceRolePhaseDependency(ret.id, entity)
  })

  it('create submitter dependency', async () => {
    const entity = dependencies.createBody(dependencies.testBody.phaseId, submitterRoleId, false)
    const ret = await service.createDependency(entity)
    await assertResourceRolePhaseDependency(ret.id, entity)
  })

  it('create dependency - resource role is inactive', async () => {
    try {
      const entity = dependencies.createBody(dependencies.testBody.phaseId, observerRoleId, true)
      await service.createDependency(entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'BadRequestError')
      should.equal(err.message, `Resource role with id: ${observerRoleId} is inactive`)
    }
  })

  it('create dependency - phaseId not found', async () => {
    try {
      const entity = dependencies.createBody(submitterRoleId, submitterRoleId, false)
      await service.createDependency(entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'NotFoundError')
      should.equal(err.message, `Not found phase id: ${submitterRoleId}`)
    }
  })

  it('create dependency - resourceRoleId not found', async () => {
    try {
      const entity = dependencies.createBody(dependencies.testBody.phaseId, dependencies.testBody.phaseId, true)
      await service.createDependency(entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'NotFoundError')
      should.equal(err.message, `ResourceRole with id: ${dependencies.testBody.phaseId} doesn't exist`)
    }
  })

  it('create dependency - conflict', async () => {
    const entity = dependencies.createBody(dependencies.testBody.phaseId, submitterRoleId, true)
    try {
      await service.createDependency(entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'ConflictError')
      assertError(err, 'There is already dependency of given phaseId and resourceRoleId')
    }
  })

  let { stringFields, booleanFields, requiredFields, testBody } = dependencies

  for (const stringField of stringFields) {
    it(`test invalid parameters, invalid string type field ${stringField}`, async () => {
      let entity = _.cloneDeep(testBody)
      _.set(entity, stringField, 123)
      try {
        await service.createDependency(entity)
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, `"${stringField}" must be a string`)
      }
    })
  }

  for (const booleanField of booleanFields) {
    it(`test invalid parameters, invalid boolean type field ${booleanField}`, async () => {
      let entity = _.cloneDeep(testBody)
      _.set(entity, booleanField, 123)
      try {
        await service.createDependency(entity)
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, `"${booleanField}" must be a boolean`)
      }
    })
  }

  for (const requiredField of requiredFields) {
    it(`test invalid parameters, required field ${requiredField} is missing`, async () => {
      let entity = _.cloneDeep(testBody)
      entity = _.omit(entity, requiredField)
      try {
        await service.createDependency(entity)
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, `"${requiredField}" is required`)
      }
    })
  }
})
