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
      await helper.getOSClient().indices.delete({ index: config.OS.OS_INDEX })
    } catch (err) {
      // ignore
    }
  })

  after(async () => {
    const body = { mappings: {} }
    body.mappings['_doc'] = {
      properties: {
        id: { type: 'keyword' }
      }
    }

    try {
      await helper.getOSClient().indices.create({
        index: config.OS.OS_INDEX,
        body
      })
    } catch (err) {
      // ignore
    }
  })

  it('get resources by admin - OS is fresh', async () => {
    const result = await service.getResources(user.admin, challengeId)
    should.equal(result.total, 0)
  })

  it('get challenges hohosky can access - OS is fresh', async () => {
    const ret = await service.listChallengesByMember('16096823', {})
    should.equal(ret.data.length, 0)
  })
})
