/**
 * E2E test of the Challenge Resource API - delete resource role phase dependency endpoint.
 */

const _ = require('lodash')
const config = require('config')
const should = require('should')
const service = require('../../src/services/ResourceRolePhaseDependencyService')
const { deleteRequest, getRoleIds } = require('../common/testHelper')
const { token } = require('../common/testData')

const dependenciesUrl = `http://localhost:${config.PORT}/${config.API_VERSION}/resource-roles/phase-dependencies`

module.exports = describe('Delete resource role phase dependency endpoint', () => {
  let dependency

  before(async () => {
    const ret = await getRoleIds()
    const submitterRoleId = ret.submitterRoleId
    const records = await service.getDependencies({ resourceRoleId: submitterRoleId })
    dependency = records[0]
  })

  it('delete dependency', async () => {
    const ret = await deleteRequest(`${dependenciesUrl}/${dependency.id}`, {}, token.admin)
    should.equal(ret.status, 200)
    should.equal(ret.body.id, dependency.id)
    should.equal(ret.body.phaseId, dependency.phaseId)
    should.equal(ret.body.resourceRoleId, dependency.resourceRoleId)
    should.equal(ret.body.phaseState, dependency.phaseState)
  })

  it('delete dependency - not found', async () => {
    try {
      await deleteRequest(`${dependenciesUrl}/${dependency.id}`, {}, token.admin)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 404)
      should.equal(_.get(err, 'response.body.message'),
        `ResourceRolePhaseDependency with id: ${dependency.id} doesn't exist`)
    }
  })

  it('delete dependency - invalid id', async () => {
    try {
      await deleteRequest(`${dependenciesUrl}/invalid`, {}, token.admin)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 400)
      should.equal(_.get(err, 'response.body.message'), '"id" must be a valid GUID')
    }
  })

  it('delete dependency - forbidden user', async () => {
    try {
      await deleteRequest(`${dependenciesUrl}/${dependency.id}`, {}, token.denis)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 403)
      should.equal(_.get(err, 'response.body.message'), 'You are not allowed to perform this action!')
    }
  })

  it('delete dependency - forbidden m2m', async () => {
    try {
      await deleteRequest(`${dependenciesUrl}/${dependency.id}`, {}, token.m2mRead)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.status, 403)
      should.equal(_.get(err, 'response.body.message'), 'You are not allowed to perform this action!')
    }
  })
})
