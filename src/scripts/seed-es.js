/**
 * Seed ES
 */

const config = require('config')
const logger = require('../common/logger')
const helper = require('../common/helper')
const resourceRoles = require('./seed/ResourceRole.json')
const resourceRolePhaseDependencys = require('./seed/ResourceRolePhaseDependency.json')

const esClient = helper.getESClient()

/*
 * Migrate records from DB to ES
 */
async function seed () {
  for (const entry of resourceRoles) {
    await esClient.create({
      index: config.get('ES.RESOURCE_ROLES_ES_INDEX'),
      type: config.get('ES.RESOURCE_ROLES_ES_TYPE'),
      refresh: config.get('ES.ES_REFRESH'),
      id: entry.id,
      body: { ...entry }
    })
  }
  logger.info(`Loaded ${resourceRoles.length} ResourceRoles`)

  for (const entry of resourceRolePhaseDependencys) {
    await esClient.create({
      index: config.get('ES.RESOURCE_ROLE_PHASE_DEPENDENCY_ES_INDEX'),
      type: config.get('ES.RESOURCE_ROLE_PHASE_DEPENDENCY_ES_TYPE'),
      refresh: config.get('ES.ES_REFRESH'),
      id: entry.id,
      body: { ...entry }
    })
  }
  logger.info(`Loaded ${resourceRolePhaseDependencys.length} ResourceRolePhaseDependencys`)
}

seed()
  .then(() => {
    logger.info('Done')
    process.exit()
  })
  .catch((err) => {
    logger.logFullError(err)
    process.exit(1)
  })
