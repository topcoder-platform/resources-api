/**
 * The configuration file.
 */

module.exports = {
  TERMS_API_URL: 'http://localhost:4000/v5/terms',
  BUSAPI_URL: 'http://localhost:4000/v5',
  CHALLENGE_PHASES_API_URL: 'http://localhost:4000/v5/challenge-phases',
  WAIT_TIME: 1500,
  MOCK_CHALLENGE_API_PORT: 4000,
  AUTH_V2_URL: process.env.AUTH_V2_URL || 'https://topcoder-dev.auth0.com/oauth/ro',
  AUTH_V2_CLIENT_ID: process.env.AUTH_V2_CLIENT_ID || '',
  AUTH_V3_URL: process.env.AUTH_V3_URL || 'https://api.topcoder-dev.com/v3/authorizations',
  ADMIN_CREDENTIALS_USERNAME: process.env.ADMIN_CREDENTIALS_USERNAME || '',
  ADMIN_CREDENTIALS_PASSWORD: process.env.ADMIN_CREDENTIALS_PASSWORD || '',
  COPILOT_CREDENTIALS_USERNAME: process.env.COPILOT_CREDENTIALS_USERNAME || '',
  COPILOT_CREDENTIALS_PASSWORD: process.env.COPILOT_CREDENTIALS_PASSWORD || '',
  USER_CREDENTIALS_USERNAME: process.env.USER_CREDENTIALS_USERNAME || '',
  USER_CREDENTIALS_PASSWORD: process.env.USER_CREDENTIALS_PASSWORD || ''
}
