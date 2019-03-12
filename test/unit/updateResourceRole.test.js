/**
 * Unit test of ResourceRoleService - update resource role.
 */

const _ = require('lodash')
const should = require('should')
const service = require('../../src/services/ResourceRoleService')
const { requestBody } = require('../common/testData')
const { assertValidationError, assertError, assertResourceRole, getRoleIds } = require('../common/testHelper')

const resourceRoles = requestBody.resourceRoles

module.exports = describe('Update resource role', () => {
  let copilotRoleId

  before(async () => {
    const ret = await getRoleIds()
    copilotRoleId = ret.copilotRoleId
  })

  it('update resource role', async () => {
    const entity = resourceRoles.createBody('co-pilot', false, false)
    const ret = await service.updateResourceRole(copilotRoleId, entity)
    should.equal(copilotRoleId, ret.id)
    await assertResourceRole(ret.id, entity)
  })

  it('update resource role again', async () => {
    const entity = resourceRoles.createBody('CO-PILOT', true, true)
    const ret = await service.updateResourceRole(copilotRoleId, entity)
    should.equal(copilotRoleId, ret.id)
    await assertResourceRole(ret.id, entity)
  })

  let { stringFields, booleanFields, requiredFields, testBody } = resourceRoles

  for (const stringField of stringFields) {
    it(`test invalid parameters, invalid string type field ${stringField}`, async () => {
      let entity = _.cloneDeep(testBody)
      _.set(entity, stringField, 123)
      try {
        await service.updateResourceRole(copilotRoleId, entity)
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
        await service.updateResourceRole(copilotRoleId, entity)
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
        await service.updateResourceRole(copilotRoleId, entity)
      } catch (err) {
        assertValidationError(err, `"${requiredField}" is required`)
      }
    })
  }

  it(`test invalid path parameter, resourceRoleId must be UUID`, async () => {
    try {
      await service.updateResourceRole('invalid', testBody)
      throw new Error('should not throw error here')
    } catch (err) {
      assertValidationError(err, `"resourceRoleId" must be a valid GUID`)
    }
  })

  it(`failure - test with not founded resource role`, async () => {
    try {
      const id = 'fe6d0a58-ce7d-4521-8501-b8132b1c0391'
      await service.updateResourceRole(id, testBody)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'NotFoundError')
      assertError(err, `ResourceRole with id: fe6d0a58-ce7d-4521-8501-b8132b1c0391 doesn't exist`)
    }
  })

  it(`failure - update resource role name duplication`, async () => {
    const entity = resourceRoles.createBody('SUBMITTER', false, true)
    try {
      await service.updateResourceRole(copilotRoleId, entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'ConflictError')
      assertError(err, 'ResourceRole with name: SUBMITTER already exist.')
    }
  })
})
