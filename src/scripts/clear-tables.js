const logger = require('../common/logger')
const prisma = require('../common/prisma').getClient()

async function main () {
  logger.debug('Clearing Member data')
  await prisma.memberProfile.deleteMany({})
  await prisma.memberStats.deleteMany({})
  logger.debug('Clearing Resource data')
  await prisma.resource.deleteMany({})
  logger.debug('Clearing ResourceRolePhaseDependency data')
  await prisma.resourceRolePhaseDependency.deleteMany({})
  logger.debug('Clearing ResourceRole data')
  await prisma.resourceRole.deleteMany({})
}

main()
  .then(() => {
    logger.info('All tables have been cleared. The processes is run asynchronously')
    process.exit()
  })
  .catch((err) => {
    logger.error(`Error clearing resource seed data ${err}`)
    logger.logFullError(err)
    process.exit(1)
  })
