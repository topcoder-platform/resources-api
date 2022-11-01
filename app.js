/**
 * The application entry point
 */

require('./app-bootstrap')

const _ = require('lodash')
const config = require('config')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const HttpStatus = require('http-status-codes')
const logger = require('./src/common/logger')
const interceptor = require('express-interceptor')
const YAML = require('yamljs')
const swaggerUi = require('swagger-ui-express')
const resourcesAPISwaggerDoc = YAML.load('./docs/swagger.yaml')

const AWSXRay = require('aws-xray-sdk')

// setup express app
const app = express()

app.use(AWSXRay.express.openSegment('v5-resources-api'))

// serve resources V5 API swagger definition
app.use('/v5/resources/docs', swaggerUi.serve, swaggerUi.setup(resourcesAPISwaggerDoc))

app.use(cors({
  // Allow browsers access pagination data in headers
  exposedHeaders: ['X-Page', 'X-Per-Page', 'X-Total', 'X-Total-Pages', 'X-Prev-Page', 'X-Next-Page']
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('port', config.PORT)

// intercept the response body from jwtAuthenticator
app.use(interceptor((req, res) => {
  return {
    isInterceptable: () => {
      return res.statusCode === 403
    },

    intercept: (body, send) => {
      let obj
      try {
        obj = JSON.parse(body)
      } catch (e) {
        logger.error('Invalid response body.')
      }
      if (obj && _.get(obj, 'result.content.message')) {
        const ret = { message: obj.result.content.message }
        res.statusCode = 401
        send(JSON.stringify(ret))
      } else {
        send(body)
      }
    }
  }
}))

// Register routes
require('./app-routes')(app)

app.use(AWSXRay.express.closeSegment())

// The error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.logFullError(err, req.signature || `${req.method} ${req.url}`)
  const errorResponse = {}
  const status = err.isJoi ? HttpStatus.BAD_REQUEST : (err.status || err.httpStatus || HttpStatus.INTERNAL_SERVER_ERROR)

  if (_.isArray(err.details)) {
    if (err.isJoi) {
      _.map(err.details, (e) => {
        if (e.message) {
          if (_.isUndefined(errorResponse.message)) {
            errorResponse.message = e.message
          } else {
            errorResponse.message += `, ${e.message}`
          }
        }
      })
    }
  }

  if (err.response) {
    // extract error message from V3 API(first _.get method) or V5 API(second _.get method)
    errorResponse.message = _.get(err, 'response.body.result.content') || _.get(err, 'response.body.message')
  }

  if (_.isUndefined(errorResponse.message)) {
    if (err.message && status !== HttpStatus.INTERNAL_SERVER_ERROR) {
      errorResponse.message = err.message
    } else {
      errorResponse.message = 'Internal server error'
    }
  }

  if (!_.isUndefined(err.metadata)) {
    errorResponse.metadata = err.metadata
  }

  res.status(status).json(errorResponse)
})

const server = app.listen(app.get('port'), () => {
  logger.info(`Express server listening on port ${app.get('port')}`)
})

if (process.env.NODE_ENV === 'test') {
  module.exports = server
}
