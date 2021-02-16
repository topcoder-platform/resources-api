/**
 * E2E test of the Challenge Resource API - edge cases.
 */

const config = require('config')
const should = require('should')
const helper = require('../../src/common/helper')
const { getRequest } = require('../common/testHelper')
const { token } = require('../common/testData')

const challengeId = 'fe6d0a58-ce7d-4521-8501-b8132b1c0391'
const resourceUrl = `http://localhost:${config.PORT}/${config.API_VERSION}/resources`

module.exports = describe('Edge cases for resources endpoint', () => {
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
    const res = await getRequest(`${resourceUrl}?challengeId=${challengeId}`, token.admin)
    should.equal(res.status, 200)
    should.equal(res.body.length, 0)
  })

  it('get challenges hohosky can access - ES is fresh', async () => {
    const res = await getRequest(`${resourceUrl}/16096823/challenges`, token.admin)
    should.equal(res.status, 200)
    should.equal(res.body.length, 0)
  })
})
