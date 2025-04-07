/**
 * Unit test of ResourceService - edge cases.
 */

const should = require('should')
const service = require('../../src/services/ResourceService')
const { user } = require('../common/testData')

const challengeId = 'fe6d0a58-ce7d-4521-8501-b8132b1c0391'

module.exports = describe('Edge cases for resource service', () => {
  it('get resources by admin - DB is fresh', async () => {
    const result = await service.getResources(user.admin, challengeId)
    should.equal(result.total, 0)
  })

  it('get challenges hohosky can access - DB is fresh', async () => {
    const ret = await service.listChallengesByMember('16096823', {})
    should.equal(ret.data.length, 0)
  })
})
