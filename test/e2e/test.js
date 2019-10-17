/**
 * E2E test of the Challenge Resource API.
 */

process.env.NODE_ENV = 'test'

global.Promise = require('bluebird')

const _ = require('lodash')
const config = require('config')
const should = require('should')
const logger = require('../../src/common/logger')
const helper = require('../../src/common/helper')
const { getRequest, putRequest } = require('../common/testHelper')

const { mockChallengeApi } = require('../../mock/mock-challenge-api')

describe('Topcoder - Challenge Resource API E2E Test', () => {
  let app
  let infoLogs = []
  let errorLogs = []
  let debugLogs = []
  const info = logger.info
  const error = logger.error
  const debug = logger.debug

  /**
   * Sleep with time from input
   * @param time the time input
   */
  const sleep = (time) => new Promise((resolve) => {
    setTimeout(resolve, time)
  })

  /**
   * Start http server with port
   * @param {Object} server the server
   * @param {Number} port the server port
   */
  const startServer = (server, port) => new Promise((resolve) => {
    server.listen(port, () => {
      resolve()
    })
  })

  /**
   * Close http server
   * @param {Object} server the server
   */
  const closeServer = (server) => new Promise((resolve) => {
    server.close(() => {
      resolve()
    })
  })

  /**
    * Initialize database tables. All data will be cleared.
    */
  const initDB = async () => {
    const roles = await helper.scan('ResourceRole')
    for (const role of roles) {
      await role.delete()
    }
    const resources = await helper.scan('Resource')
    for (const resource of resources) {
      await resource.delete()
    }
  }

  before(async () => {
    // start mock server for v5 challenge api
    await startServer(mockChallengeApi, config.MOCK_CHALLENGE_API_PORT)

    // inject logger with log collector
    logger.info = (message) => {
      infoLogs.push(message)
      info(message)
    }
    logger.debug = (message) => {
      debugLogs.push(message)
      debug(message)
    }
    logger.error = (message) => {
      errorLogs.push(message)
      error(message)
    }

    // start the application
    app = require('../../app')

    // wait until application init successfully
    while (true) {
      if (infoLogs.some(x => String(x).includes('Express server listening on port'))) {
        break
      }
      await sleep(config.WAIT_TIME)
    }

    await initDB()
  })

  after(async () => {
    // close server
    await closeServer(mockChallengeApi)
    await closeServer(app)

    // restore logger
    logger.error = error
    logger.info = info
    logger.debug = debug

    await initDB()
  })

  describe('Health check endpoints', () => {
    it('health check success', async () => {
      const res = await getRequest(`http://localhost:${config.PORT}/${config.API_VERSION}/resources/health`)
      should.equal(res.status, 200)
      should.equal(res.body.checksRun, 1)
    })
  })

  describe('Fail routes Tests', () => {
    it('Unsupported http method, return 405', async () => {
      try {
        await putRequest(`http://localhost:${config.PORT}/${config.API_VERSION}/resourceRoles`, {})
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 405)
        should.equal(_.get(err, 'response.body.message'), 'The requested HTTP method is not supported.')
      }
    })

    it('Http resource not found, return 404', async () => {
      try {
        await getRequest(`http://localhost:${config.PORT}/${config.API_VERSION}/invalid`)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.status, 404)
        should.equal(_.get(err, 'response.body.message'), 'The requested resource cannot be found.')
      }
    })
  })

  describe('Resource Roles endpoints', () => {
    require('./createResourceRole.test')
    require('./getResourceRoles.test')
    require('./updateResourceRole.test')
  })

  describe('Resources endpoints', () => {
    require('./createResource.test')
    require('./getResources.test')
    require('./listChallengesByMember.test')
    require('./deleteResource.test')
  })
})
