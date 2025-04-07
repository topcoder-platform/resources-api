/**
 * Unit test of the Challenge Resource API.
 */

process.env.NODE_ENV = 'test'

require('../../app-bootstrap')

const config = require('config')
const logger = require('../../src/common/logger')
const testHelper = require('../common/testHelper')
const prisma = require('../../src/common/prisma').getClient()

const { mockChallengeApi } = require('../../mock/mock-challenge-api')

describe('Topcoder - Challenge Resource API Unit Test', () => {
  let infoLogs = []
  let errorLogs = []
  let debugLogs = []
  const info = logger.info
  const error = logger.error
  const debug = logger.debug

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
    await prisma.memberStats.deleteMany()
    await prisma.memberProfile.deleteMany()
    await prisma.resource.deleteMany()
    await prisma.resourceRolePhaseDependency.deleteMany()
    await prisma.resourceRole.deleteMany()
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

    testHelper.initLogs(errorLogs)

    await initDB()

    await prisma.memberStats.createMany({
      data: [{
        userId: 16096823,
        handle: 'hohosky',
        handleLower: 'hohosky',
        maxRating: 2000,
        createdBy: 'testdata'
      }, {
        userId: 251280,
        handle: 'denis',
        handleLower: 'denis',
        maxRating: 0,
        createdBy: 'testdata'
      }]
    })

    await prisma.memberProfile.createMany({
      data: [{
        userId: 16096823,
        handle: 'hohosky',
        handleLower: 'hohosky',
        createdBy: 'testdata'
      }, {
        userId: 251280,
        handle: 'denis',
        handleLower: 'denis',
        createdBy: 'testdata'
      }]
    })
  })

  after(async () => {
    // close server
    await closeServer(mockChallengeApi)

    // restore logger
    logger.error = error
    logger.info = info
    logger.debug = debug

    await initDB()
  })

  describe('ResourceRoleService Unit Test', () => {
    require('./createResourceRole.test')
    require('./getResourceRoles.test')
    require('./updateResourceRole.test')
  })

  describe('ResourceRolePhaseDependencyService Unit Test', () => {
    require('./createResourceRolePhaseDependency.test')
    require('./getResourceRolePhaseDependencies.test')
    require('./updateResourceRolePhaseDependency.test')
    require('./deleteResourceRolePhaseDependency.test')
  })

  describe('ResourceService Unit Test', () => {
    before(async () => {
      await prisma.resourceRole.create({
        data: {
          id: config.SUBMITTER_RESOURCE_ROLE_ID,
          name: 'dummy_submitter',
          fullReadAccess: true,
          fullWriteAccess: true,
          isActive: true,
          selfObtainable: true,
          nameLower: 'dummy_submitter',
          createdBy: 'testdata'
        }
      })
    })
    require('./edgeCasesForResourceService.test')
    require('./createResource.test')
    require('./getResources.test')
    require('./listChallengesByMember.test')
    require('./deleteResource.test')
  })
})
