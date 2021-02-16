/**
 * Unit test of ResourceService - edge cases.
 */

const config = require('config')
const should = require('should')
const helper = require('../../src/common/helper')
const service = require('../../src/services/ResourceService')
const { user } = require('../common/testData')

const challengeId = 'fe6d0a58-ce7d-4521-8501-b8132b1c0391'

module.exports = describe('Edge cases for resource service', () => {
  before(async () => {
    try {
      await helper.getESClient().indices.delete({ index: config.ES.ES_INDEX })
    } catch (err) {
      // ignore
    }
  })

  after(async () => {
    const body = { mappings: {} }
    body.mappings[config.get('ES.ES_TYPE')] = {
      properties: {
        id: { type: 'keyword' }
      }
    }

    try {
      await helper.getESClient().indices.create({
        index: config.ES.ES_INDEX,
        body
      })
    } catch (err) {
      // ignore
    }
  })

  it('get resources by admin - ES is fresh', async () => {
    const result = await service.getResources(user.admin, challengeId)
    should.equal(result.total, 0)
  })

  it('get challenges hohosky can access - ES is fresh', async () => {
    const ret = await service.listChallengesByMember('16096823', {})
    should.equal(ret.data.length, 0)
  })
})
