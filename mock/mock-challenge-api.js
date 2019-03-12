/**
 * The mock challenge API.
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
    }

    if (req.method === 'GET' && req.url.match(/^\/v5\/challenges\/[a-zA-Z0-9-]+$/)) {
      const list = req.url.split('/')
      const challengeId = list[3]
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(challengeId)) {
        if (challengeId.startsWith('11111111')) {
          return send(res, 404, { message: `Challenge with id: ${challengeId} doesn't exist.` })
        } else {
          return send(res, 200, { id: challengeId })
        }
      } else {
        return send(res, 400, { message: `Challenge id: ${challengeId} should be a UUID.` })
      }
    } else {
      // 404 for other routes
      res.statusCode = 404
      res.end('Not Found')
    }
  })
})

if (!module.parent) {
  const port = config.MOCK_CHALLENGE_API_PORT
  mockChallengeApi.listen(port)
  console.log(`mock challenge api is listen port ${port}`)
}

module.exports = {
  mockChallengeApi
}
