/**
 * Unit test of the Challenge Resource API.
 */

process.env.NODE_ENV = 'test'

require('../../app-bootstrap')

const config = require('config')
const logger = require('../../src/common/logger')
const helper = require('../../src/common/helper')
const testHelper = require('../common/testHelper')

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

    testHelper.initLogs(errorLogs)

    await initDB()
    await testHelper.initES()

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

    // restore logger
    logger.error = error
    logger.info = info
    logger.debug = debug

    await initDB()
    await testHelper.initES()
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
