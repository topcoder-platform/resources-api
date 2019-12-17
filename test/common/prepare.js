/*
 * Setting up Mock for all tests
 */

const nock = require('nock')
const prepare = require('mocha-prepare')

prepare(function (done) {
  // Mock Posting to Bus API
  nock(/topcoder-dev.com/, { allowUnmocked: true })
    .persist()
    .post('/v5/bus/events')
    .reply(204)
  done()
}, function (done) {
  // called after all test completes (regardless of errors)
  nock.cleanAll()
  done()
})
