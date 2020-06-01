/**
 * The configuration file.
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || 3000,
  API_VERSION: process.env.API_VERSION || 'v5',

  AUTH_SECRET: process.env.AUTH_SECRET || 'mysecret',
  VALID_ISSUERS: process.env.VALID_ISSUERS || '["https://api.topcoder-dev.com", "https://api.topcoder.com", "https://topcoder-dev.auth0.com/"]',

  AUTH0_URL: process.env.AUTH0_URL || 'https://topcoder-dev.auth0.com/oauth/token',
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || 'https://m2m.topcoder-dev.com/',
  TOKEN_CACHE_TIME: process.env.TOKEN_CACHE_TIME || 90,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || 'jGIf2pd3f44B1jqvOai30BIKTZanYBfU',
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET || 'ldzqVaVEbqhwjM5KtZ79sG8djZpAVK8Z7qieVcC3vRjI4NirgcinKSBpPwk6mYYP',
  AUTH0_PROXY_SERVER_URL: process.env.AUTH0_PROXY_SERVER_URL,

  MEMBER_API_URL: process.env.MEMBER_API_URL || 'https://api.topcoder-dev.com/v3/members',
  USER_API_URL: process.env.USER_API_URL || 'https://api.topcoder-dev.com/v3/users',
  CHALLENGE_API_URL: process.env.CHALLENGE_API_URL || 'http://localhost:4000/v5/challenges',
  CHALLENGE_PHASES_API_URL: process.env.CHALLENGE_PHASES_API_URL || 'https://api.topcoder-dev.com/v5/challenge-phases',

  DYNAMODB: {
    // AWS_ACCESS_KEY_ID: process.env.AWS_FAKE_ID,
    // AWS_SECRET_ACCESS_KEY: process.env.AWS_FAKE_KEY,
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    IS_LOCAL_DB: process.env.IS_LOCAL_DB ? process.env.IS_LOCAL_DB === 'true' : true,
    URL: process.env.DYNAMODB_URL || 'http://localhost:8000',
    AWS_READ_UNITS: process.env.AWS_READ_UNITS || 4,
    AWS_WRITE_UNITS: process.env.AWS_WRITE_UNITS || 2,
    TIMEOUT: process.env.DYNAMODB_TIMEOUT || 10000
  },

  ES: {
    // above AWS_REGION is used if we use AWS ES
    HOST: process.env.ES_HOST || 'localhost:9200',
    API_VERSION: process.env.ES_API_VERSION || '6.8',
    RESOURCE_ROLES_ES_INDEX: process.env.RESOURCE_ROLES_ES_INDEX || 'resource_role',
    RESOURCE_ROLES_ES_TYPE: process.env.RESOURCE_ROLES_ES_TYPE || '_doc', // ES 6.x accepts only 1 Type per index and it's mandatory to define it
    RESOURCE_ROLE_PHASE_DEPENDENCY_ES_INDEX: process.env.RESOURCE_ROLE_PHASE_DEPENDENCY_ES_INDEX || 'resource_role_phase_dependency',
    RESOURCE_ROLE_PHASE_DEPENDENCY_ES_TYPE: process.env.RESOURCE_ROLE_PHASE_DEPENDENCY_ES_TYPE || '_doc', // ES 6.x accepts only 1 Type per index and it's mandatory to define it
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
  RESOURCE_ROLE_UPDATE_TOPIC: process.env.RESOURCE_ROLE_UPDATE_TOPIC || 'challenge.action.resource.role.update'
}
