/**
 * The configuration file.
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || 3000,
  API_VERSION: process.env.API_VERSION || 'v5',
  DEFAULT_PAGE_SIZE: process.env.DEFAULT_PAGE_SIZE || 1000,
  // used to properly set the header response to api calls for services behind a load balancer
  API_BASE_URL: process.env.API_BASE_URL || `http://localhost:3000`,

  AUTH_SECRET: process.env.AUTH_SECRET || 'mysecret',
  VALID_ISSUERS: process.env.VALID_ISSUERS || '["https://api.topcoder-dev.com", "https://api.topcoder.com", "https://topcoder-dev.auth0.com/"]',

  SUBMITTER_RESOURCE_ROLE_ID: process.env.SUBMITTER_RESOURCE_ROLE_ID || '732339e7-8e30-49d7-9198-cccf9451e221',

  AUTH0_URL: process.env.AUTH0_URL || 'https://topcoder-dev.auth0.com/oauth/token',
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || 'https://m2m.topcoder-dev.com/',
  TOKEN_CACHE_TIME: process.env.TOKEN_CACHE_TIME || 90,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || '',
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET || '',
  AUTH0_PROXY_SERVER_URL: process.env.AUTH0_PROXY_SERVER_URL,

  TERMS_API_URL: process.env.TERMS_API_URL || 'https://api.topcoder-dev.com/v5/terms',
  MEMBER_API_URL: process.env.MEMBER_API_URL || 'https://api.topcoder-dev.com/v5/members',
  USER_API_URL: process.env.USER_API_URL || 'https://api.topcoder-dev.com/v3/users',
  CHALLENGE_API_URL: process.env.CHALLENGE_API_URL || 'http://localhost:4000/v5/challenges',
  CHALLENGE_PHASES_API_URL: process.env.CHALLENGE_PHASES_API_URL || 'https://api.topcoder-dev.com/v5/challenge-phases',

  DYNAMODB: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    IS_LOCAL_DB: process.env.IS_LOCAL_DB ? process.env.IS_LOCAL_DB === 'true' : true,
    DYNAMODB_URL: process.env.DYNAMODB_URL || 'http://localhost:7777',
    URL: process.env.DYNAMODB_URL || 'http://localhost:7777',
    AWS_READ_UNITS: process.env.AWS_READ_UNITS || 4,
    AWS_WRITE_UNITS: process.env.AWS_WRITE_UNITS || 2,
    TIMEOUT: process.env.DYNAMODB_TIMEOUT || 10000
  },

  ES: {
    // above AWS_REGION is used if we use AWS ES
    HOST: process.env.ES_HOST || 'localhost:9200',
    API_VERSION: process.env.ES_API_VERSION || '6.8',
    ES_INDEX: process.env.ES_INDEX || 'resources',
    ES_TYPE: process.env.ES_TYPE || '_doc', // ES 6.x accepts only 1 Type per index and it's mandatory to define it
    ES_REFRESH: process.env.ES_REFRESH || 'true'
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
  RESOURCE_ROLE_UPDATE_TOPIC: process.env.RESOURCE_ROLE_UPDATE_TOPIC || 'challenge.action.resource.role.update',

  AUTOMATED_TESTING_NAME_PREFIX: process.env.AUTOMATED_TESTING_NAME_PREFIX || 'POSTMANE2E-'
}
