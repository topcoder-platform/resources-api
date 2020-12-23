/**
 * E2E test of the Challenge Resource API - create resource endpoint.
 */

const _ = require('lodash')
const config = require('config')
const should = require('should')
const { v4: uuid } = require('uuid')
const helper = require('../../src/common/helper')
const ResourceRolePhaseDependencyService = require('../../src/services/ResourceRolePhaseDependencyService')
const ResourceRoleService = require('../../src/services/ResourceRoleService')
const { postRequest, getRoleIds, assertResource, clearDependencies } = require('../common/testHelper')
const { token, requestBody } = require('../common/testData')

const challengeId1 = 'fe6d0a58-ce7d-4521-8501-b8132b1c0391'
const challengeId2 = 'fe6d0a58-ce7d-4521-8501-b8132b1c0392'
const challengeId3 = 'fe6d0a58-ce7d-4521-8501-b8132b1c0393'
const phaseId1 = 'ad123e44-c6c4-4cb3-8c60-e0339e1eaa3e'
const phaseId2 = 'ad123e44-c6c4-4cb3-8c60-e0339e1eaa40'
const phaseId3 = 'ad123e44-c6c4-4cb3-8c60-e0339e1eaa41'
const phaseId4 = 'ad123e44-c6c4-4cb3-8c60-e0339e1eaa42'
const challengeNotFoundId = '11111111-ce7d-4521-8501-b8132b1c0391'
const resourceUrl = `http://localhost:${config.PORT}/${config.API_VERSION}/resources`
const resources = requestBody.resources

module.exports = describe('Create resource endpoint', () => {
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
        const body = resources.createBody('HoHoSKY', copilotRoleId, challengeId1)
        await postRequest(resourceUrl, body, token.hohosky)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 400)
        should.equal(_.get(err, 'response.body.message'), `Phase ${dependency.phaseId} should not be open`)
      }
    })

    it('create resource - wrong phase state 2', async () => {
      await ResourceRolePhaseDependencyService.updateDependency(dependency.id, {
        phaseId: phaseId1,
        resourceRoleId: dependency.resourceRoleId,
        phaseState: true
      })
      try {
        const body = resources.createBody('HoHoSKY', copilotRoleId, challengeId1)
        await postRequest(resourceUrl, body, token.hohosky)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 400)
        should.equal(_.get(err, 'response.body.message'), `Phase ${phaseId1} should be open`)
      }
    })

    it('create resource - wrong phase state 3', async () => {
      await ResourceRolePhaseDependencyService.updateDependency(dependency.id, {
        phaseId: phaseId2,
        resourceRoleId: dependency.resourceRoleId,
        phaseState: true
      })
      try {
        const body = resources.createBody('HoHoSKY', copilotRoleId, challengeId1)
        await postRequest(resourceUrl, body, token.hohosky)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 400)
        should.equal(_.get(err, 'response.body.message'), `Phase ${phaseId2} should be open`)
      }
    })

    it('create resource - wrong phase state 4', async () => {
      await ResourceRolePhaseDependencyService.updateDependency(dependency.id, {
        phaseId: phaseId3,
        resourceRoleId: dependency.resourceRoleId,
        phaseState: true
      })
      try {
        const body = resources.createBody('HoHoSKY', copilotRoleId, challengeId1)
        await postRequest(resourceUrl, body, token.hohosky)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 400)
        should.equal(_.get(err, 'response.body.message'), `Phase ${phaseId3} should be open`)
      }
    })
  })

  describe('create resource - other cases', async () => {
    it('create resource - task already assign', async () => {
      const resourceId = uuid()
      await helper.getESClient().create({
        index: config.ES.ES_INDEX,
        type: config.ES.ES_TYPE,
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
        const body = resources.createBody('hohosky', config.SUBMITTER_RESOURCE_ROLE_ID, challengeId2)
        await postRequest(resourceUrl, body, token.hohosky)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 409)
        should.equal(_.get(err, 'response.body.message'), 'The Task is already assigned')
      } finally {
        await helper.getESClient().delete({
          index: config.ES.ES_INDEX,
          type: config.ES.ES_TYPE,
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

      const body = resources.createBody('HoHoSKY', copilotRoleId, challengeId1)
      const res = await postRequest(resourceUrl, body, token.admin)
      should.equal(res.status, 200)
      should.equal(res.body.roleId, body.roleId)
      should.equal(res.body.memberHandle.toLowerCase(), body.memberHandle.toLowerCase())
      await assertResource(res.body.id, res.body)
    })

    it('failure - create duplicate resource 1', async () => {
      const body = resources.createBody('hohosky', copilotRoleId, challengeId1)
      try {
        await postRequest(resourceUrl, body, token.hohosky)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 409)
        should.equal(_.get(err, 'response.body.message'), `User hohosky already has resource with roleId: ${copilotRoleId} in challenge: ${challengeId1}`)
      }
    })

    it('failure - create duplicate resource 2', async () => {
      await ResourceRolePhaseDependencyService.updateDependency(dependency.id, {
        phaseId: phaseId4,
        resourceRoleId: dependency.resourceRoleId,
        phaseState: true
      })

      const body = resources.createBody('hohosky', copilotRoleId, challengeId1)
      try {
        await postRequest(resourceUrl, body, token.hohosky)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 409)
        should.equal(_.get(err, 'response.body.message'), `User hohosky already has resource with roleId: ${copilotRoleId} in challenge: ${challengeId1}`)
      }

      // remove the dependencies so that below tests will not have these limitations
      await clearDependencies()
    })

    it('create another resource for user hohosky', async () => {
      const body = resources.createBody('HoHoSKY', reviewerRoleId, challengeId1)
      const res = await postRequest(resourceUrl, body, token.admin)
      should.equal(res.status, 200)
      await assertResource(res.body.id, res.body)
    })

    it('create resource by user', async () => {
      const body = resources.createBody('denis', submitterRoleId, challengeId1)
      const res = await postRequest(resourceUrl, body, token.hohosky)
      should.equal(res.status, 200)
      await assertResource(res.body.id, res.body)
    })

    it('failure - create self obtainable resource for other user by normal user 403', async () => {
      const body = resources.createBody('lars2520', config.SUBMITTER_RESOURCE_ROLE_ID, challengeId2)
      try {
        await postRequest(resourceUrl, body, token.denis)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 403)
        should.equal(_.get(err, 'response.body.message'), 'Only M2M, admin or user with full access role can perform this action')
      }
    })

    it('failure - create resource when user has not yet agreed terms', async () => {
      const body = resources.createBody('lars2520', config.SUBMITTER_RESOURCE_ROLE_ID, challengeId1)
      try {
        await postRequest(resourceUrl, body, token.admin)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 403)
        should.equal(_.get(err, 'response.body.message'), 'The user has not yet agreed to the following terms: [term_title]')
      }
    })

    it('create self obtainable resource by user itself', async () => {
      const body = resources.createBody('lars2520', submitterRoleId, challengeId1)
      const res = await postRequest(resourceUrl, body, token.lars2520)
      should.equal(res.status, 200)
      await assertResource(res.body.id, res.body)
    })

    it('failure - create non self obtainable resource by normal user 403', async () => {
      const body = resources.createBody('lars2520', copilotRoleId, challengeId1)
      try {
        await postRequest(resourceUrl, body, token.lars2520)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 403)
        should.equal(_.get(err, 'response.body.message'), `Only M2M, admin or user with full access role can perform this action`)
      }
    })

    it('create resource using m2m token', async () => {
      const body = resources.createBody('ghostar', submitterRoleId, challengeId1)
      const res = await postRequest(resourceUrl, body, token.m2m)
      should.equal(res.status, 200)
      await assertResource(res.body.id, res.body)
    })

    it('create resource for user ghostar 1', async () => {
      const body = resources.createBody('ghostar', reviewerRoleId, challengeId2)
      const res = await postRequest(resourceUrl, body, token.m2m)
      should.equal(res.status, 200)
      await assertResource(res.body.id, res.body)
    })

    it('create resource for user ghostar 2', async () => {
      const body = resources.createBody('ghostar', reviewerRoleId, challengeId3)
      const res = await postRequest(resourceUrl, body, token.m2m)
      should.equal(res.status, 200)
      await assertResource(res.body.id, res.body)
    })

    it('create resource using inactive role, expected 400', async () => {
      const body = resources.createBody('ghostar', observerRoleId, challengeId1)
      try {
        await postRequest(resourceUrl, body, token.m2m)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 400)
        should.equal(_.get(err, 'response.body.message'), `Resource role with id: ${observerRoleId} is inactive, please use an active one.`)
      }
    })

    it('create resource using non-existed role, expected 400', async () => {
      const body = resources.createBody('ghostar', challengeId1, challengeId1)
      try {
        await postRequest(resourceUrl, body, token.m2m)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 400)
        should.equal(_.get(err, 'response.body.message'), `No resource role found with id: ${challengeId1}.`)
      }
    })

    it(`create resource member doesn't exist, expected 400`, async () => {
      const body = resources.createBody('123abcx', challengeId1, challengeId1)
      try {
        await postRequest(resourceUrl, body, token.m2m)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 400)
        should.equal(_.get(err, 'response.body.message'), `User with handle: 123abcx doesn't exist`)
      }
    })

    let { stringFields, requiredFields, testBody } = resources

    it(`test invalid path parameter, challengeId must be UUID`, async () => {
      let body = _.cloneDeep(testBody)
      body.challengeId = 'invalid'
      try {
        await postRequest(resourceUrl, body, token.admin)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 400)
        should.equal(_.get(err, 'response.body.message'), `"challengeId" must be a valid GUID`)
      }
    })

    for (const stringField of stringFields) {
      it(`test invalid parameters, invalid string type field ${stringField}`, async () => {
        let body = _.cloneDeep(testBody)
        _.set(body, stringField, 123)
        try {
          await postRequest(resourceUrl, body, token.admin)
          throw new Error('should not throw error here')
        } catch (err) {
          should.equal(err.status, 400)
          should.equal(_.get(err, 'response.body.message'), `"${stringField}" must be a string`)
        }
      })
    }

    for (const requiredField of requiredFields) {
      it(`test invalid parameters, required field ${requiredField} is missing`, async () => {
        let body = _.cloneDeep(testBody)
        body = _.omit(body, requiredField)
        try {
          await postRequest(resourceUrl, body, token.admin)
          throw new Error('should not throw error here')
        } catch (err) {
          should.equal(err.status, 400)
          should.equal(_.get(err, 'response.body.message'), `"${requiredField}" is required`)
        }
      })
    }

    it(`test without token, expected 401`, async () => {
      try {
        await postRequest(resourceUrl, testBody)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 401)
        should.equal(_.get(err, 'response.body.message'), 'No token provided.')
      }
    })

    it(`test with invalid token(invalid), expected 401`, async () => {
      try {
        await postRequest(resourceUrl, testBody, 'invalid')
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 401)
        should.equal(_.get(err, 'response.body.message'), 'Invalid Token.')
      }
    })

    it(`test with invalid token(expired), expected 401`, async () => {
      try {
        await postRequest(resourceUrl, testBody, token.expired)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 401)
        should.equal(_.get(err, 'response.body.message'), 'Failed to authenticate token.')
      }
    })

    it(`test with user without permission, expected 403`, async () => {
      const body = resources.createBody('tonyj', submitterRoleId, challengeId1)
      try {
        await postRequest(resourceUrl, body, token.denis)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 403)
        should.equal(_.get(err, 'response.body.message'), 'Only M2M, admin or user with full access role can perform this action')
      }
    })

    it(`test with invalid M2M token, expected 403`, async () => {
      const body = resources.createBody('tonyj', submitterRoleId, challengeId1)
      try {
        await postRequest(resourceUrl, body, token.m2mRead)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 403)
        should.equal(_.get(err, 'response.body.message'), 'You are not allowed to perform this action!')
      }
    })

    it('create resource for non-existed challenge, expected 404', async () => {
      const body = resources.createBody('ghostar', observerRoleId, challengeNotFoundId)
      try {
        await postRequest(resourceUrl, body, token.m2m)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 404)
        should.equal(_.get(err, 'response.body.message'), `Challenge with id: ${challengeNotFoundId} doesn't exist.`)
      }
    })
  })
})
