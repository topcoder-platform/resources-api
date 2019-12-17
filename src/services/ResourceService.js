/**
 * This service provides operations of resource roles.
 */

const _ = require('lodash')
const config = require('config')
const Joi = require('joi')
const uuid = require('uuid/v4')
const helper = require('../common/helper')
const logger = require('../common/logger')
const errors = require('../common/errors')
const constants = require('../../app-constants')

const payloadFields = ['id', 'challengeId', 'memberId', 'memberHandle', 'roleId']

/**
 * Get resources with given criteria (may include challengeId, memberId, roleId) from Elasticsearch.
 * @param {Object} criteria the search criteria
 * @returns {Array} the resources of given criteria
 */
async function getResourcesFromES (criteria) {
  // construct ES query
  const esQuery = {
    index: config.ES.RESOURCE_INDEX,
    type: config.ES.RESOURCE_TYPE,
    size: constants.MAX_ES_SEARCH_SIZE, // use a large size to query all matched records
    body: {
      query: {
        bool: {
          filter: []
        }
      },
      sort: [{ memberId: { order: 'asc' } }]
    }
  }
  if (criteria.challengeId) {
    esQuery.body.query.bool.filter.push({ match_phrase: { challengeId: criteria.challengeId } })
  }
  if (criteria.memberId) {
    esQuery.body.query.bool.filter.push({ match_phrase: { memberId: criteria.memberId } })
  }
  if (criteria.roleId) {
    esQuery.body.query.bool.filter.push({ match_phrase: { roleId: criteria.roleId } })
  }

  // Search with constructed query
  const esClient = helper.getESClient()
  const docs = await esClient.search(esQuery)
  return _.map(docs.hits.hits, (item) => item._source)
}

/**
 * Check whether the user can access resources
 * @param {Object} currentUser the current user
 * @param {Array} the resources of specified challenge id
 */
async function checkAccess (currentUser, resources) {
  // try to get resource roles from ES
  let list
  try {
    list = await helper.getResourceRolesFromES({ isActive: true })
  } catch (e) {
    logger.logFullError(e)
    // ignore error
  }
  // get from DB if failed or not found
  if (_.isNil(list) || _.isEmpty(list)) {
    list = await helper.scan('ResourceRole')
  }

  const fullAccessRoles = new Set()
  _.each(list, e => {
    if (e.isActive && e.fullAccess) {
      fullAccessRoles.add(e.id)
    }
  })
  if (!_.reduce(resources,
    (result, r) => r.memberId === currentUser.userId && fullAccessRoles.has(r.roleId) ? true : result,
    false)) {
    throw new errors.ForbiddenError(`Only M2M, admin or user with full access role can perform this action`)
  }
}

/**
 * Get resources with given challenge id.
 * @param {Object} currentUser the current user
 * @param {String} challengeId the challenge id
 * @returns {Array} the resources
 */
async function getResources (currentUser, challengeId) {
  // Verify that the challenge exists
  await helper.getRequest(`${config.CHALLENGE_API_URL}/${challengeId}`)

  // try to get resources from ES
  let resources
  try {
    resources = await getResourcesFromES({ challengeId })
  } catch (e) {
    logger.logFullError(e)
    // ignore error
  }
  // get from DB if failed or not found
  if (_.isNil(resources) || _.isEmpty(resources)) {
    resources = await helper.query('Resource', { challengeId })
  }

  if (!currentUser.isMachine && !helper.hasAdminRole(currentUser)) {
    await checkAccess(currentUser, resources)
  }

  return resources
}

getResources.schema = {
  currentUser: Joi.any(),
  challengeId: Joi.id()
}

/**
 * Get member information using v3 API
 * @param {String} memberHandle the member handle
 * @returns {Object} the member info
 */
async function getMemberInfo (memberHandle) {
  let memberId, handle
  try {
    const res = await helper.getRequest(`${config.MEMBER_API_URL}/${memberHandle}`)
    if (_.get(res, 'body.result.content.userId')) {
      memberId = String(res.body.result.content.userId)
    }
    // handle return from v3 API, handle and memberHandle are the same under case-insensitive condition
    handle = _.get(res, 'body.result.content.handle')
  } catch (error) {
    // re-throw all error except 404 Not-Founded, BadRequestError should be thrown if 404 occurs
    if (error.status !== 404) {
      throw error
    }
  }

  if (_.isUndefined(memberId)) {
    throw new errors.BadRequestError(`User with handle: ${memberHandle} doesn't exist`)
  }

  return { memberId, handle }
}

/**
 * Get the resource role.
 * @param {String} roleId the resource role id
 * @param {Boolean} isCreated the flag indicate it is create operation.
 * @returns {Object} the resource role
 */
async function getResourceRole (roleId, isCreated) {
  try {
    const resourceRole = await helper.getById('ResourceRole', roleId)
    if (isCreated && !resourceRole.isActive) {
      throw new errors.BadRequestError(`Resource role with id: ${roleId} is inactive, please use an active one.`)
    }
    return resourceRole
  } catch (error) {
    if (error.name === 'NotFoundError') {
      throw new errors.BadRequestError(`No resource role found with id: ${roleId}.`)
    } else {
      throw error
    }
  }
}

/**
 * Perform initialization. It will validate the input parameters(memberHandle and roleId),
 * check access for operating user.
 * Resource entities with specified challenge id will be returned if operating user is not admin/M2M.
 * If operating user is admin/M2M, it will return resource entities matching specified
 * challenge id and member id(retrieve via member handle).
 * @param {Object} currentUser the current user
 * @param {String} challengeId the challenge id
 * @param {Object} resource the resource to be created
 * @param {Boolean} isCreated the flag indicate it is create operation.
 * @returns {Object} the resource entities and member information.
 */
async function init (currentUser, challengeId, resource, isCreated) {
  // Verify that the challenge exists
  await helper.getRequest(`${config.CHALLENGE_API_URL}/${challengeId}`)

  // get member information using v3 API
  const { memberId, handle } = await getMemberInfo(resource.memberHandle)
  // ensure resource role existed
  const resourceRole = await getResourceRole(resource.roleId, isCreated)

  // perform access validation
  let resources
  if (!currentUser.isMachine && !helper.hasAdminRole(currentUser)) {
    resources = await helper.query('Resource', { challengeId })
    if (!resourceRole.selfObtainable || memberId !== currentUser.userId) {
      // if user is not creating/deleting a self obtainable resource for itself
      // we need to perform check access first
      await checkAccess(currentUser, resources)
    }
  } else {
    // fetch resources for specified challenge and member
    resources = await helper.query('Resource', {
      hash: { challengeId: { eq: challengeId } },
      range: { memberId: { eq: memberId } }
    })
  }

  // return resources and the member id
  return { resources, memberId, handle }
}

/**
 * Create resource for a challenge.
 * @param {Object} currentUser the current user
 * @param {Object} resource the resource to be created
 * @returns {Object} the created resource
 */
async function createResource (currentUser, resource) {
  try {
    const challengeId = resource.challengeId

    const { resources, memberId, handle } = await init(currentUser, challengeId, resource, true)
    if (handle) {
      resource.memberHandle = handle
    }

    if (_.reduce(resources,
      (result, r) => r.memberId === memberId && r.roleId === resource.roleId ? true : result,
      false)) {
      throw new errors.ConflictError(`User ${resource.memberHandle} already has resource with roleId: ${resource.roleId} in challenge: ${challengeId}`)
    }

    const ret = await helper.create('Resource', _.assign({
      id: uuid(),
      memberId,
      created: new Date(),
      createdBy: currentUser.handle || currentUser.sub
    }, resource))

    await helper.postEvent(config.RESOURCE_CREATE_TOPIC, _.pick(ret, payloadFields))

    return ret
  } catch (err) {
    if (!helper.isCustomError(err)) {
      await helper.postEvent(config.KAFKA_ERROR_TOPIC, { error: _.pick(err, 'name', 'message', 'stack') })
    }
    throw err
  }
}

createResource.schema = {
  currentUser: Joi.any(),
  resource: Joi.object().keys({
    challengeId: Joi.id(),
    memberHandle: Joi.string().required(),
    roleId: Joi.id()
  }).required()
}

/**
 * Delete resource from a challenge.
 * @param {Object} currentUser the current user
 * @param {Object} resource the resource to be deleted
 * @returns {Object} the deleted resource
 */
async function deleteResource (currentUser, resource) {
  try {
    const challengeId = resource.challengeId

    const { resources, memberId, handle } = await init(currentUser, challengeId, resource)

    const ret = _.reduce(resources,
      (result, r) => r.memberId === memberId && r.roleId === resource.roleId ? r : result,
      undefined)

    if (!ret) {
      throw new errors.BadRequestError(`User ${handle || resource.memberHandle} doesn't have resource with roleId: ${resource.roleId} in challenge ${challengeId}`)
    }

    await ret.delete()

    await helper.postEvent(config.RESOURCE_DELETE_TOPIC, _.pick(ret, payloadFields))

    return ret
  } catch (err) {
    if (!helper.isCustomError(err)) {
      await helper.postEvent(config.KAFKA_ERROR_TOPIC, { error: _.pick(err, 'name', 'message', 'stack') })
    }
    throw err
  }
}

deleteResource.schema = {
  currentUser: Joi.any(),
  resource: Joi.object().keys({
    challengeId: Joi.id(),
    memberHandle: Joi.string().required(),
    roleId: Joi.id()
  }).required()
}

/**
 * List all challenge ids that given member has access to.
 * @param {Number} memberId the member id
 * @param {Object} criteria the criteria, only has resourceRoleId filter
 * @returns {Array} an array of challenge ids represents challenges that given member has access to.
 */
async function listChallengesByMember (memberId, criteria) {
  const res = await helper.getRequest(`${config.USER_API_URL}?filter=id=${memberId}`)
  if (_.get(res, 'body.result.content').length === 0) {
    throw new errors.BadRequestError(`User with id: ${memberId} doesn't exist`)
  }
  if (criteria.resourceRoleId) {
    // ensure resource role exists
    await getResourceRole(criteria.resourceRoleId)
  }

  // try to get resources from ES
  let resources
  try {
    resources = await getResourcesFromES({ memberId, roleId: criteria.resourceRoleId })
  } catch (e) {
    logger.logFullError(e)
    // ignore error
  }
  // get from DB if failed or not found
  if (_.isNil(resources) || _.isEmpty(resources)) {
    const queryParams = { hash: { memberId: { eq: String(memberId) } } }
    if (criteria.resourceRoleId) {
      queryParams.range = { roleId: { eq: criteria.resourceRoleId } }
    }
    resources = await helper.query('Resource', queryParams)
  }

  return _.uniq(_.map(resources, 'challengeId'))
}

listChallengesByMember.schema = {
  memberId: Joi.number().integer().positive().required(),
  criteria: Joi.object().keys({
    resourceRoleId: Joi.string().uuid()
  }).required()
}

module.exports = {
  getResources,
  createResource,
  deleteResource,
  listChallengesByMember
}

logger.buildService(module.exports)
