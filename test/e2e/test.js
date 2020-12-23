/**
 * E2E test of the Challenge Resource API.
 */

process.env.NODE_ENV = 'test'

require('../../app-bootstrap')

const _ = require('lodash')
const config = require('config')
const should = require('should')
const logger = require('../../src/common/logger')
const helper = require('../../src/common/helper')
const { getRequest, putRequest, initES } = require('../common/testHelper')

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
    const dependencies = await helper.scan('ResourceRolePhaseDependency')
    for (const d of dependencies) {
      await d.delete()
    }
    const staties = await helper.scan('MemberStats')
    for (const s of staties) {
      await s.delete()
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
    await initES()

    await helper.create('MemberStats', {
      userId: '16096823',
      handle: 'hohosky',
      handleLower: 'hohosky',
      maxRating: { rating: 2000 }
    })

    await helper.create('MemberStats', {
      userId: '251280',
      handle: 'denis',
      handleLower: 'denis'
    })
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
    await initES()
  })

  describe('Health check endpoints', () => {
    it('health check success', async () => {
      const res = await getRequest(`http://localhost:${config.PORT}/${config.API_VERSION}/resources/health`)
      should.equal(res.status, 200)
      should.equal(res.body.checksRun, 1)
    })
  })

  describe('Failure routes Tests', () => {
    it('Unsupported http method, return 405', async () => {
      try {
        await putRequest(`http://localhost:${config.PORT}/${config.API_VERSION}/resource-roles`, {})
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

  describe('Resource Role Phase Dependencies endpoints', () => {
    require('./createResourceRolePhaseDependency.test')
    require('./getResourceRolePhaseDependencies.test')
    require('./updateResourceRolePhaseDependency.test')
    require('./deleteResourceRolePhaseDependency.test')
  })

  describe('Resources endpoints', () => {
    before(async () => {
      await helper.create('ResourceRole', {
        id: config.SUBMITTER_RESOURCE_ROLE_ID,
        name: 'dummy_submitter',
        fullReadAccess: false,
        fullWriteAccess: true,
        isActive: true,
        selfObtainable: true,
        nameLower: 'dummy_submitter'
      })
    })
    require('./edgeCasesForResourceService.test')
    require('./createResource.test')
    require('./getResources.test')
    require('./listChallengesByMember.test')
    require('./deleteResource.test')
  })
})
