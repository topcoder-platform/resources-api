const express = require('express')
const cors = require('cors')
const config = require('config')
const winston = require('winston')
const _ = require('lodash')
const constants = require('../app-constants')

// load challenge data from json file
const challenges = require('./data/Challenge.json')

const app = express()
app.set('port', config.MOCK_API_PORT)

app.use(cors())

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`
})

const logConsole = new winston.transports.Console({
  format: winston.format.combine(winston.format.colorize(), logFormat)
})
winston.add(logConsole)

// get all phases
app.get('/challenge-phases', (req, res) => {
  winston.info('Getting challenge phases')
  const phases = require('./data/Phase.json')
  res.setHeader('X-Total', phases.length)
  winston.info(`Returning challenge phases count ${phases.length}`)
  res.json(phases)
})

const testChallengeIds = [
  '99c2898d-f45c-466a-a054-daade31a6c0e',
  '6620c0d0-d699-4598-aec1-f3073b5b2b93',
  'e738245d-4037-49e0-954f-646d25c27259',
  '11ecf5b1-856a-4233-99ac-875796c15508',
  'dff99767-4447-4cae-ba00-d41215198937',
  '8c8a868a-739d-4457-acd8-f69bba67a090'
]

// get challenge details
app.get('/challenges/:challengeId', (req, res) => {
  const challengeId = req.params.challengeId
  winston.info(`Getting challenge details ${challengeId}`)
  const c = _.find(challenges, t => t.id === challengeId)
  if (!_.isNil(c)) {
    res.json(c)
    winston.info(`Returning challenge details for ${c.id}`)
  } else if (_.includes(testChallengeIds, challengeId)) {
    res.json({ id: challengeId, status: constants.ChallengeStatuses.Completed })
    winston.info(`Return completed challenge for ${challengeId}`)
  } else {
    res.statusCode = 404
    res.json({ message: 'No challenge found' })
  }
})

// challenge advance phase
app.post('/challenges/:challengeId/advance-phase', (req, res) => {
  const challengeId = req.params.challengeId
  winston.info(`Advance challenge phase for ${challengeId}`)
  const allIds = _.map(challenges, 'id')
  if (!_.includes(allIds, challengeId)) {
    res.statusCode = 404
    res.json({ message: 'No challenge found' })
  } else {
    winston.info(`Done advancing challenge phase for ${challengeId}`)
    // directly return 200
    res.json({})
  }
})

// submission API
app.get('/submissions', (req, res) => {
  const challengeId = req.query.challengeId
  const memberId = req.query.memberId
  winston.info(`Getting submission for ${memberId} in challenge ${challengeId}`)
  // mock one submission for challenge 11111111-2222-3333-4444-555555555556 and user lazybear
  if (challengeId === '11111111-2222-3333-4444-555555555556' && _.toString(memberId) === '23225544') {
    winston.info(`Returning mock submission info`)
    res.json([{
      id: 'submission-id'
    }])
  } else {
    winston.info(`Returning empty submission info`)
    res.json([])
  }
})

let mockMemberId = 123456
// get member by handle
app.get('/members/:handle', (req, res) => {
  const handle = req.params.handle
  winston.info(`Getting member profile for ${handle}`)
  res.json({
    userId: mockMemberId,
    email: `${handle}@topcoder.com`
  })
  mockMemberId += 1
})

app.use((req, res) => {
  res.status(404).json({ error: 'route not found' })
})

app.use((err, req, res, next) => {
  winston.error(err)
  res.status(500).json({
    error: err.message
  })
})

if (!module.parent) {
  app.listen(app.get('port'), '0.0.0.0', () => {
    winston.info(`Express server listening on port ${app.get('port')}`)
  })
}

module.exports = {
  mockApi: app
}
