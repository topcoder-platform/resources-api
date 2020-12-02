/**
 * Unit test of ResourceRolePhaseDependencyService - update resource role phase dependency.
 */

const _ = require('lodash')
const should = require('should')
const service = require('../../src/services/ResourceRolePhaseDependencyService')
const { requestBody } = require('../common/testData')
const { assertValidationError, assertError, assertResourceRolePhaseDependency, getRoleIds } = require('../common/testHelper')

const dependencies = requestBody.resourceRolePhaseDependencies

module.exports = describe('Update resource role phase dependency', () => {
  let dependency
  let copilotRoleId
  let reviewerRoleId

  before(async () => {
    const ret = await getRoleIds()
    copilotRoleId = ret.copilotRoleId
    reviewerRoleId = ret.reviewerRoleId
    const submitterRoleId = ret.submitterRoleId
    const records = await service.getDependencies({ resourceRoleId: submitterRoleId })
    dependency = records[0]
  })

  it('update dependency', async () => {
    const entity = dependencies.createBody(dependency.phaseId, reviewerRoleId, true)
    const ret = await service.updateDependency(dependency.id, entity)
    await assertResourceRolePhaseDependency(ret.id, entity)
  })

  it('update dependency again', async () => {
    const entity = dependencies.createBody(dependency.phaseId, dependency.resourceRoleId, true)
    const ret = await service.updateDependency(dependency.id, entity)
    await assertResourceRolePhaseDependency(ret.id, entity)
  })

  it('update dependency - phaseId not found', async () => {
    try {
      const entity = dependencies.createBody(dependency.resourceRoleId, dependency.resourceRoleId, false)
      await service.updateDependency(dependency.id, entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'NotFoundError')
      should.equal(err.message, `Not found phase id: ${dependency.resourceRoleId}`)
    }
  })

  it('update dependency - resourceRoleId not found', async () => {
    try {
      const entity = dependencies.createBody(dependencies.testBody.phaseId, dependencies.testBody.phaseId, true)
      await service.updateDependency(dependency.id, entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'NotFoundError')
      should.equal(err.message, `ResourceRole with id: ${dependencies.testBody.phaseId} doesn't exist`)
    }
  })

  it(`update dependency - conflict`, async () => {
    const entity = dependencies.createBody(dependency.phaseId, copilotRoleId, true)
    try {
      await service.updateDependency(dependency.id, entity)
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
        await service.updateDependency(dependency.id, entity)
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
        await service.updateDependency(dependency.id, entity)
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
        await service.updateDependency(dependency.id, entity)
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, `"${requiredField}" is required`)
      }
    })
  }
})
