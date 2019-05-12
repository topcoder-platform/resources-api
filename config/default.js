/**
 * The configuration file.
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || 3000,

  AUTH_SECRET: process.env.AUTH_SECRET || 'mysecret',
  VALID_ISSUERS: process.env.VALID_ISSUERS || '["https://api.topcoder-dev.com", "https://api.topcoder.com", "https://topcoder-dev.auth0.com/"]',

  AUTH0_URL: process.env.AUTH0_URL || 'https://topcoder-dev.auth0.com/oauth/token',
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || 'https://m2m.topcoder-dev.com/',
  TOKEN_CACHE_TIME: process.env.TOKEN_CACHE_TIME || 90,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || 'e6oZAxnoFvjdRtjJs1Jt3tquLnNSTs0e',
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET || 'OGCzOnQkhYTQpZM3NI0sD--JJ_EPcm2E7707_k6zX11m223LrRK1-QZL4Pon4y-D',
  AUTH0_PROXY_SERVER_URL: process.env.AUTH0_PROXY_SERVER_URL,

  MEMBER_API_URL: process.env.MEMBER_API_URL || 'https://api.topcoder-dev.com/v3/members',
  CHALLENGE_API_URL: process.env.CHALLENGE_API_URL || 'http://localhost:4000/v5/challenges',

  DYNAMODB: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'FAKE_ACCESS_KEY',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || 'FAKE_SECRET_ACCESS_KEY',
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    IS_LOCAL: process.env.IS_LOCAL || true,
    URL: process.env.DYNAMODB_URL || 'http://localhost:7777',
    TIMEOUT: process.env.DYNAMODB_TIMEOUT || 10000 // 10 seconds
  },

  SCOPES: {
    READ: process.env.SCOPE_READ || 'read:resources',
    CREATE: process.env.SCOPE_CREATE || 'create:resources',
    DELETE: process.env.SCOPE_DELETE || 'delete:resources',
    UPDATE: process.env.SCOPE_UPDATE || 'update:resources',
    ALL: process.env.SCOPE_ALL || 'all:resources'
  },

  BUSAPI_URL: process.env.BUSAPI_URL || 'https://api.topcoder-dev.com/v5',
  KAFKA_ERROR_TOPIC: process.env.KAFKA_ERROR_TOPIC || 'common.error.reporting',
  KAFKA_MESSAGE_ORIGINATOR: process.env.KAFKA_MESSAGE_ORIGINATOR || 'resources-api',
  RESOURCE_CREATE_TOPIC: process.env.RESOURCE_CREATE_TOPIC || 'challenge.action.resource.create',
  RESOURCE_DELETE_TOPIC: process.env.RESOURCE_DELETE_TOPIC || 'challenge.action.resource.delete',
  RESOURCE_ROLE_CREATE_TOPIC: process.env.RESOURCE_ROLE_CREATE_TOPIC || 'challenge.action.resource.role.create',
  RESOURCE_ROLE_UPDATE_TOPIC: process.env.RESOURCE_ROLE_UPDATE_TOPIC || 'challenge.action.resource.role.update'
}
