/**
 * Unit test of ResourceService - create resource.
 */

const _ = require('lodash')
const config = require('config')
const should = require('should')
const { v4: uuid } = require('uuid')
const helper = require('../../src/common/helper')
const service = require('../../src/services/ResourceService')
const ResourceRolePhaseDependencyService = require('../../src/services/ResourceRolePhaseDependencyService')
const ResourceRoleService = require('../../src/services/ResourceRoleService')
const { requestBody, user } = require('../common/testData')
const { assertValidationError, assertError, assertResource, getRoleIds, clearDependencies } = require('../common/testHelper')

const challengeId1 = 'fe6d0a58-ce7d-4521-8501-b8132b1c0391'
const challengeId2 = 'fe6d0a58-ce7d-4521-8501-b8132b1c0392'
const challengeId3 = 'fe6d0a58-ce7d-4521-8501-b8132b1c0393'
const phaseId1 = 'ad123e44-c6c4-4cb3-8c60-e0339e1eaa3e'
const phaseId2 = 'ad123e44-c6c4-4cb3-8c60-e0339e1eaa40'
const phaseId3 = 'ad123e44-c6c4-4cb3-8c60-e0339e1eaa41'
const phaseId4 = 'ad123e44-c6c4-4cb3-8c60-e0339e1eaa42'
const challengeNotFoundId = '11111111-ce7d-4521-8501-b8132b1c0391'
const resources = requestBody.resources

module.exports = describe('Create resource', () => {
  let copilotRoleId
  let observerRoleId
  let submitterRoleId
  let reviewerRoleId
  let dependency

  before(async () => {
    const ret = await getRoleIds()
    copilotRoleId = ret.copilotRoleId
    observerRoleId = ret.observerRoleId
    submitterRoleId = ret.submitterRoleId
    reviewerRoleId = ret.reviewerRoleId

    const records = await ResourceRolePhaseDependencyService.getDependencies({ resourceRoleId: copilotRoleId })
    dependency = records[0]
  })

  describe('create resource - wrong phase cases', async () => {
    before(async () => {
      await ResourceRoleService.updateResourceRole(copilotRoleId, {
        name: 'co-pilot',
        isActive: true,
        selfObtainable: true
      })
    })

    after(async () => {
      await ResourceRoleService.updateResourceRole(copilotRoleId, {
        name: 'co-pilot',
        isActive: true,
        selfObtainable: false
      })
    })

    it('create resource - wrong phase state 1', async () => {
      await ResourceRolePhaseDependencyService.updateDependency(dependency.id, {
        phaseId: dependency.phaseId,
        resourceRoleId: dependency.resourceRoleId,
        phaseState: false
      })
      try {
        const entity = resources.createBody('HoHoSKY', copilotRoleId, challengeId1)
        await service.createResource(user.hohosky, entity)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.name, 'BadRequestError')
        assertError(err, `Phase ${dependency.phaseId} should not be open`)
      }
    })

    it('create resource - wrong phase state 2', async () => {
      await ResourceRolePhaseDependencyService.updateDependency(dependency.id, {
        phaseId: phaseId1,
        resourceRoleId: dependency.resourceRoleId,
        phaseState: true
      })
      try {
        const entity = resources.createBody('HoHoSKY', copilotRoleId, challengeId1)
        await service.createResource(user.hohosky, entity)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.name, 'BadRequestError')
        assertError(err, `Phase ${phaseId1} should be open`)
      }
    })

    it('create resource - wrong phase state 3', async () => {
      await ResourceRolePhaseDependencyService.updateDependency(dependency.id, {
        phaseId: phaseId2,
        resourceRoleId: dependency.resourceRoleId,
        phaseState: true
      })
      try {
        const entity = resources.createBody('HoHoSKY', copilotRoleId, challengeId1)
        await service.createResource(user.hohosky, entity)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.name, 'BadRequestError')
        assertError(err, `Phase ${phaseId2} should be open`)
      }
    })

    it('create resource - wrong phase state 4', async () => {
      await ResourceRolePhaseDependencyService.updateDependency(dependency.id, {
        phaseId: phaseId3,
        resourceRoleId: dependency.resourceRoleId,
        phaseState: true
      })
      try {
        const entity = resources.createBody('HoHoSKY', copilotRoleId, challengeId1)
        await service.createResource(user.hohosky, entity)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.name, 'BadRequestError')
        assertError(err, `Phase ${phaseId3} should be open`)
      }
    })
  })

  describe('create resource - other cases', async () => {
    it('create resource - task already assign', async () => {
      const resourceId = uuid()
      await helper.getOSClient().create({
        index: config.OS.OS_INDEX,
        id: resourceId,
        body: {
          id: resourceId,
          challengeId: challengeId2,
          memberId: 16096823,
          memberHandle: 'hohosky',
          roleId: config.SUBMITTER_RESOURCE_ROLE_ID
        },
        refresh: 'true'
      })
      try {
        const entity = resources.createBody('hohosky', config.SUBMITTER_RESOURCE_ROLE_ID, challengeId2)
        await service.createResource(user.hohosky, entity)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.name, 'ConflictError')
        assertError(err, 'The Task is already assigned')
      } finally {
        await helper.getOSClient().delete({
          index: config.OS.OS_INDEX,
          id: resourceId,
          refresh: 'true'
        })
      }
    })

    it('create resource by admin', async () => {
      await ResourceRolePhaseDependencyService.updateDependency(dependency.id, {
        phaseId: dependency.phaseId,
        resourceRoleId: dependency.resourceRoleId,
        phaseState: true
      })
      const entity = resources.createBody('HoHoSKY', copilotRoleId, challengeId1)
      const ret = await service.createResource(user.admin, entity)
      should.equal(ret.roleId, entity.roleId)
      should.equal(ret.memberHandle.toLowerCase(), entity.memberHandle.toLowerCase())
      await assertResource(ret.id, ret)
    })

    it('failure - create duplicate resource 1', async () => {
      const entity = resources.createBody('hohosky', copilotRoleId, challengeId1)
      try {
        await service.createResource(user.hohosky, entity)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.name, 'ConflictError')
        assertError(err, `User hohosky already has resource with roleId: ${copilotRoleId} in challenge: ${challengeId1}`)
      }
    })

    it('failure - create duplicate resource 2', async () => {
      await ResourceRolePhaseDependencyService.updateDependency(dependency.id, {
        phaseId: phaseId4,
        resourceRoleId: dependency.resourceRoleId,
        phaseState: true
      })

      const entity = resources.createBody('hohosky', copilotRoleId, challengeId1)
      try {
        await service.createResource(user.hohosky, entity)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.name, 'ConflictError')
        assertError(err, `User hohosky already has resource with roleId: ${copilotRoleId} in challenge: ${challengeId1}`)
      }

      // remove the dependencies so that below tests will not have these limitations
      await clearDependencies()
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

    it('failure - create self obtainable resource for other user by normal user forbidden', async () => {
      const entity = resources.createBody('lars2520', config.SUBMITTER_RESOURCE_ROLE_ID, challengeId2)
      try {
        await service.createResource(user.denis, entity)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.name, 'ForbiddenError')
        assertError(err, `Only M2M, admin or user with full access role can perform this action`)
      }
    })

    it('failure - create resource when user has not yet agreed terms', async () => {
      const entity = resources.createBody('lars2520', config.SUBMITTER_RESOURCE_ROLE_ID, challengeId1)
      try {
        await service.createResource(user.admin, entity)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.name, 'ForbiddenError')
        assertError(err, 'The user has not yet agreed to the following terms: [term_title]')
      }
    })

    it('create self obtainable resource by user itself', async () => {
      const entity = resources.createBody('lars2520', submitterRoleId, challengeId1)
      const ret = await service.createResource(user.lars2520, entity)
      should.equal(ret.roleId, entity.roleId)
      should.equal(ret.memberHandle.toLowerCase(), entity.memberHandle.toLowerCase())
      await assertResource(ret.id, ret)
    })

    it('failure - create non self obtainable resource by normal user forbidden', async () => {
      const entity = resources.createBody('lars2520', copilotRoleId, challengeId1)
      try {
        await service.createResource(user.lars2520, entity)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.name, 'ForbiddenError')
        assertError(err, `Only M2M, admin or user with full access role can perform this action`)
      }
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
  })
})
