/**
 * Contains all routes
 */

const constants = require('../app-constants')
const { SCOPES: { READ, CREATE, DELETE, UPDATE, ALL } } = require('config')

module.exports = {
  '/health': {
    get: {
      controller: 'HealthCheckController',
      method: 'check'
    }
  },
  '/resources': {
    get: {
      controller: 'ResourceController',
      method: 'getResources',
      auth: 'jwt',
      access: [constants.UserRoles.Admin, constants.UserRoles.User],
      scopes: [READ, ALL]
    },
    post: {
      controller: 'ResourceController',
      method: 'createResource',
      auth: 'jwt',
      access: [constants.UserRoles.Admin, constants.UserRoles.User],
      scopes: [CREATE, ALL]
    },
    delete: {
      controller: 'ResourceController',
      method: 'deleteResource',
      auth: 'jwt',
      access: [constants.UserRoles.Admin, constants.UserRoles.User],
      scopes: [DELETE, ALL]
    }
  },
  '/resources/:memberId/challenges': {
    get: {
      controller: 'ResourceController',
      method: 'listChallengesByMember',
      auth: 'jwt',
      access: [constants.UserRoles.Admin, constants.UserRoles.User],
      scopes: [READ, ALL]
    }
  },
  '/resourceRoles': {
    get: {
      controller: 'ResourceRoleController',
      method: 'getResourceRoles',
      auth: 'jwt',
      access: [constants.UserRoles.Admin, constants.UserRoles.User],
      scopes: [READ, ALL]
    },
    post: {
      controller: 'ResourceRoleController',
      method: 'createResourceRole',
      auth: 'jwt',
      access: [constants.UserRoles.Admin],
      scopes: [CREATE, ALL]
    }
  },
  '/resourceRoles/:resourceRoleId': {
    put: {
      controller: 'ResourceRoleController',
      method: 'updateResourceRole',
      auth: 'jwt',
      access: [constants.UserRoles.Admin],
      scopes: [UPDATE, ALL]
    }
  }
}
