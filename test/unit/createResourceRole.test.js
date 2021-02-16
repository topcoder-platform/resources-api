/**
 * Unit test of ResourceRoleService - create resource role.
 */

const _ = require('lodash')
const should = require('should')
const service = require('../../src/services/ResourceRoleService')
const helper = require('../../src/common/helper')
const { requestBody } = require('../common/testData')
const { assertValidationError, assertError, assertResourceRole } = require('../common/testHelper')

const resourceRoles = requestBody.resourceRoles

module.exports = describe('Create resource role', () => {
  it('create active full-access resource role', async () => {
    const entity = resourceRoles.createBody('co-pilot', true, true, true, false)
    const ret = await service.createResourceRole(entity)
    await assertResourceRole(ret.id, entity)
  })

  it('create inactive full-access resource role', async () => {
    const entity = resourceRoles.createBody('Observer', true, false, false, false)
    const ret = await service.createResourceRole(entity)
    await assertResourceRole(ret.id, entity)
    const resourceRole = await helper.getById('ResourceRole', ret.id)
    await helper.update(resourceRole, { legacyId: 1 })
  })

  it('create active not full-access resource role', async () => {
    const entity = resourceRoles.createBody('submitter', false, true, true, true)
    const ret = await service.createResourceRole(entity)
    await assertResourceRole(ret.id, entity)
  })

  it('create reviewer resource role', async () => {
    const entity = resourceRoles.createBody('reviewer', false, true, true, false)
    const ret = await service.createResourceRole(entity)
    await assertResourceRole(ret.id, entity)
  })

  let { stringFields, booleanFields, requiredFields, testBody } = resourceRoles

  for (const stringField of stringFields) {
    it(`test invalid parameters, invalid string type field ${stringField}`, async () => {
      let entity = _.cloneDeep(testBody)
      _.set(entity, stringField, 123)
      try {
        await service.createResourceRole(entity)
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
        await service.createResourceRole(entity)
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
        await service.createResourceRole(entity)
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, `"${requiredField}" is required`)
      }
    })
  }

  it(`failure - create duplicate resource role`, async () => {
    const entity = resourceRoles.createBody('SUBMITTER', false, true, true, true)
    try {
      await service.createResourceRole(entity)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.name, 'ConflictError')
      assertError(err, 'ResourceRole with name: SUBMITTER already exist.')
    }
  })
})
