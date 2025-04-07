/**
 * Seed table data in database
 */
const _ = require('lodash')
const logger = require('../common/logger')
const prisma = require('../common/prisma').getClient()

logger.info('Requesting to seed data to the resources tables...')

const createdBy = 'seed-data'

async function importResourceRole () {
  let data = require('./seed/ResourceRole.json')
  data = _.map(data, d => {
    const r = {
      ...d,
      nameLower: d.name.toLowerCase(),
      createdBy
    }
    if (_.isUndefined(d.fullReadAccess)) {
      r.fullReadAccess = false
    }
    if (_.isUndefined(d.fullWriteAccess)) {
      r.fullWriteAccess = false
    }
    return r
  })
  await prisma.resourceRole.createMany({ data })
  logger.info('Imported ResourceRole data')
}

async function importResourceRolePhaseDependency () {
  let data = require('./seed/ResourceRolePhaseDependency.json')
  data = _.map(data, d => ({
    ...d,
    createdBy
  }))
  await prisma.resourceRolePhaseDependency.createMany({ data })
  logger.info('Imported ResourceRolePhaseDependency data')
}

async function importResource () {
  let data = require('./seed/Resource.json')
  let memberData = {}
  data = _.map(data, d => {
    const r = _.omit(d, ['created', 'rating'])
    r.createdAt = d.created
    // collect member data
    const memberId = _.parseInt(d.memberId)
    if (!_.keys(memberData).includes(memberId)) {
      memberData[memberId] = {
        userId: memberId,
        handle: d.memberHandle,
        handleLower: d.memberHandle.toLowerCase(),
        maxRating: _.get(d, 'rating', null),
        createdBy
      }
    }
    return r
  })
  await prisma.resource.createMany({ data })
  logger.info('Imported ResourceRole data')
  // import memberProfile and memberStats
  memberData = _.values(memberData)
  await prisma.memberStats.createMany({ data: memberData })
  await prisma.memberProfile.createMany({ data: _.map(memberData, d => _.omit(d, 'maxRating')) })
  logger.info('Imported Member data')
}

async function main () {
  await importResourceRole()
  await importResourceRolePhaseDependency()
  await importResource()
}

main()
  .then(() => {
    logger.info('All tables have been inserted with the data. The processes is run asynchronously')
    process.exit()
  })
  .catch((err) => {
    logger.error(`Error loading resource seed data ${err}`)
    logger.logFullError(err)
    process.exit(1)
  })
