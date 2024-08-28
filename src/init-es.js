/**
 * Initialize elastic search.
 * It will create configured index in elastic search if it is not present.
 * It can delete and re-create index if providing an extra 'force' argument.
 * Usage:
 * node src/init-es
 * node src/init-es force
 */
const config = require('config')
const logger = require('./common/logger')
const helper = require('./common/helper')

const client = helper.getOSClient()

const initES = async () => {
  if (process.argv.length === 3 && process.argv[2] === 'force') {
    logger.info(`Delete index ${config.OS.OS_INDEX} if any.`)
    try {
      await client.indices.delete({ index: config.OS.OS_INDEX })
    } catch (err) {
      // ignore
    }
  }

  const exists = await client.indices.exists({ index: config.OS.OS_INDEX })
  if (exists) {
    logger.info(`The index ${config.OS.OS_INDEX} exists.`)
  } else {
    logger.info(`The index ${config.OS.OS_INDEX} will be created.`)

    const body = { mappings: {} }
    body.mappings['_doc'] = {
      properties: {
        id: { type: 'keyword' },
        memberHandle: {
          type: 'text',
          fielddata: true
        }
      }
    }

    await client.indices.create({
      index: config.OS.OS_INDEX,
      body
    })
  }
}

initES().then(() => {
  logger.info('Done!')
  process.exit()
}).catch((e) => {
  logger.logFullError(e)
  process.exit()
})
