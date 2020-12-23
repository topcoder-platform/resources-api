/**
 * The mock challenge APIs.
 */

const config = require('config')
const http = require('http')
const send = require('http-json-response')
const logger = require('../src/common/logger')
const m2mVerify = require('tc-core-library-js').auth.verifier
const verify = m2mVerify(config.VALID_ISSUERS, '24h')

const mockChallengeApi = http.createServer((req, res) => {
  logger.debug(`${req.method} ${req.url}`)
  // Parse the token from request header
  let token
  if (req.headers.authorization) {
    const authHeaderParts = req.headers.authorization.split(' ')
    if (authHeaderParts.length === 2 && authHeaderParts[0] === 'Bearer') {
      token = authHeaderParts[1]
    }
  }

  verify.validateToken(token, config.AUTH_SECRET, (error, decoded) => {
    if (error) {
      res.statusCode = 401
      res.end('Not Authorized')
      return
    }

    if (req.method === 'GET' && req.url.match(/^\/v5\/challenges\/[a-zA-Z0-9-]+$/)) {
      const list = req.url.split('/')
      const challengeId = list[3]
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(challengeId)) {
        if (challengeId.startsWith('11111111')) {
          return send(res, 404, { message: `Challenge with id: ${challengeId} doesn't exist.` })
        } else {
          return send(res, 200, {
            id: challengeId,
            task: {
              isTask: challengeId === 'fe6d0a58-ce7d-4521-8501-b8132b1c0392'
            },
            terms: challengeId === 'fe6d0a58-ce7d-4521-8501-b8132b1c0392' ? [{
              id: 'ae6d0a58-ce7d-4521-8501-b8132b1c0391',
              roleId: 'aa5a3f78-79e0-4bf7-93ff-b11e8f5b398b'
            }] : [{
              id: 'ae6d0a58-ce7d-4521-8501-b8132b1c0392',
              roleId: config.SUBMITTER_RESOURCE_ROLE_ID
            }, {
              id: 'ae6d0a58-ce7d-4521-8501-b8132b1c0393',
              roleId: config.SUBMITTER_RESOURCE_ROLE_ID
            }],
            phases: [{
              phaseId: 'aa5a3f78-79e0-4bf7-93ff-b11e8f5b398b',
              isOpen: true
            }, {
              phaseId: 'cfe12b3f-2a12-4639-9d8b-ec86726f7644',
              isOpen: false
            }, {
              phaseId: 'ad123e44-c6c4-4cb3-8c60-e0339e1eaa3e',
              actualStartDate: '2020-01-01',
              actualEndDate: '2020-01-02'
            }, {
              phaseId: 'ad123e44-c6c4-4cb3-8c60-e0339e1eaa40',
              scheduledStartDate: '2020-01-01',
              scheduledEndDate: '2020-01-02'
            }, {
              phaseId: 'ad123e44-c6c4-4cb3-8c60-e0339e1eaa41'
            }]
          })
        }
      } else {
        return send(res, 400, { message: `Challenge id: ${challengeId} should be a UUID.` })
      }
    } else if (req.method === 'GET' && req.url.match(/^\/v5\/terms\/[a-zA-Z0-9-]+\?userId=[0-9]+$/)) {
      const list1 = req.url.split('/')
      const list2 = list1[3].split('?')
      const termId = list2[0]
      return send(res, 200, { agreed: termId.endsWith('3'), title: 'term_title' })
    } else if (req.method === 'GET' && req.url.match(/^\/v5\/challenge-phases.*$/)) {
      res.setHeader('x-total', '6')
      return send(res, 200, [
        { id: 'aa5a3f78-79e0-4bf7-93ff-b11e8f5b398b' },
        { id: 'cfe12b3f-2a12-4639-9d8b-ec86726f7644' },
        { id: 'ad123e44-c6c4-4cb3-8c60-e0339e1eaa3e' },
        { id: 'ad123e44-c6c4-4cb3-8c60-e0339e1eaa40' },
        { id: 'ad123e44-c6c4-4cb3-8c60-e0339e1eaa41' },
        { id: 'ad123e44-c6c4-4cb3-8c60-e0339e1eaa42' }
      ])
    } else if (req.method === 'POST' && req.url.match(/^\/v5\/bus\/events$/)) {
      return send(res, 200, {})
    } else {
      // 404 for other routes
      res.statusCode = 404
      res.end('Not Found')
    }
  })
})

if (!module.parent) {
  const port = config.MOCK_CHALLENGE_API_PORT || 4000
  mockChallengeApi.listen(port)
  console.log(`mock challenge api is listen port ${port}`)
}

module.exports = {
  mockChallengeApi
}
