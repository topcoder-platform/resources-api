/**
 * The configuration file.
 */

module.exports = {
  TERMS_API_URL: 'http://localhost:4000/v5/terms',
  BUSAPI_URL: 'http://localhost:4000/v5',
  CHALLENGE_PHASES_API_URL: 'http://localhost:4000/v5/challenge-phases',
  DYNAMODB: {
    AWS_ACCESS_KEY_ID: 'FAKE_ACCESS_KEY',
    AWS_SECRET_ACCESS_KEY: 'FAKE_SECRET_ACCESS_KEY',
    URL: 'http://localhost:7777'
  },
  WAIT_TIME: 1500,
  MOCK_CHALLENGE_API_PORT: 4000
}
