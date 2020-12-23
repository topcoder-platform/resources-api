/**
 * This service provides operations of resource roles.
 */

const _ = require('lodash')
const config = require('config')
const Joi = require('joi')
const { v4: uuid } = require('uuid')
const { validate: validateUUID } = require('uuid')
const moment = require('moment')
const helper = require('../common/helper')
const logger = require('../common/logger')
const errors = require('../common/errors')
const ResourceRolePhaseDependencyService = require('./ResourceRolePhaseDependencyService')

const payloadFields = ['id', 'challengeId', 'memberId', 'memberHandle', 'roleId', 'created', 'createdBy', 'updated', 'updatedBy', 'legacyId']

/**
 * Check whether the user can access resources
 * @param {Object} currentUser the current user
 * @param {Array} the resources of specified challenge id
 */
async function checkAccess (currentUser, resources) {
  const list = await helper.scan('ResourceRole')
  const fullAccessRoles = new Set()
  _.each(list, e => {
    if (e.isActive && e.fullReadAccess && e.fullWriteAccess) {
      fullAccessRoles.add(e.id)
    }
  })
  if (!_.reduce(resources,
    (result, r) => _.toString(r.memberId) === _.toString(currentUser.userId) && fullAccessRoles.has(r.roleId) ? true : result,
    false)) {
    throw new errors.ForbiddenError(`Only M2M, admin or user with full access role can perform this action`)
  }
}

/**
 * Get resources with given challenge id.
 * @param {Object} currentUser the current user
 * @param {String} challengeId the challenge id
 * @param {String} roleId the role id to filter on
 * @param {Number} page The page number
 * @param {Number} perPage The number of items to list per page
 * @returns {Array} the search result
 */
async function getResources (currentUser, challengeId, roleId, page, perPage, sortBy, sortOrder) {
  if (!validateUUID(challengeId)) {
    throw new errors.BadRequestError(`Challenge ID ${challengeId} must be a valid v5 Challenge Id (UUID)`)
  }
  try {
  // Verify that the challenge exists
    await helper.getRequest(`${config.CHALLENGE_API_URL}/${challengeId}`)
  } catch (e) {
    throw new errors.NotFoundError(`Challenge ID ${challengeId} not found`)
  }

  const boolQuery = []
  const mustQuery = []
  let hasFullAccess

  // Check if the user has a resource with full access on the challenge
  if (currentUser) {
    const resources = await helper.query('Resource', { challengeId })
    try {
      await checkAccess(currentUser, resources)
      hasFullAccess = true
    } catch (e) {
      hasFullAccess = false
    }
  }

  boolQuery.push({ match_phrase: { challengeId } })

  // logger.warn('User Check')
  if (!currentUser) {
    // if the user is not logged in, only return resources with submitter role ID
    boolQuery.push({ match_phrase: { roleId: config.SUBMITTER_RESOURCE_ROLE_ID } })
  } else if (!currentUser.isMachine && !helper.hasAdminRole(currentUser) && !hasFullAccess) {
    // await checkAccess(currentUser, resources)
    // if not admin, and not machine, only return submitters + all my roles
    boolQuery.push({
      bool: {
        should: [
          { match_phrase: { memberId: currentUser.userId } },
          {
            bool: {
              must: [
                { match_phrase: { roleId: config.SUBMITTER_RESOURCE_ROLE_ID } }
              ],
              must_not: [
                { match_phrase: { memberId: currentUser.userId } }
              ]
            }
          }
        ]
      }
    })
  } else if (roleId) {
    boolQuery.push({ match_phrase: { roleId } })
  }

  mustQuery.push({
    bool: {
      filter: boolQuery
    }
  })

  const esQuery = {
    index: config.get('ES.ES_INDEX'),
    type: config.get('ES.ES_TYPE'),
    size: perPage,
    from: perPage * (page - 1), // Es Index starts from 0
    body: {
      query: {
        bool: {
          must: mustQuery
        }
      },
      sort: [{ [sortBy]: { 'order': sortOrder } }]
    }
  }
  const esClient = await helper.getESClient()
  let docs
  // logger.debug(`ES Query ${JSON.stringify(esQuery)}`)
  try {
    docs = await esClient.search(esQuery)
  } catch (e) {
    // Catch error when the ES is fresh and has no data
    logger.info(`Query Error from ES ${JSON.stringify(e)}`)

    docs = {
      hits: {
        total: 0,
        hits: []
      }
    }
  }
  // Extract data from hits
  const allResources = _.map(docs.hits.hits, item => item._source)
  const resources = _.map(allResources, item => ({ ...item, memberId: (_.toString(item.memberId)) }))
  // logger.warn('Resources extracted')

  const memberIds = _.uniq(_.map(resources, r => r.memberId))

  let memberObjects = []
  for (let i = 0; i < memberIds.length; i += 1) {
    const id = memberIds[i]
    memberObjects.push(await helper.getMemberInfoById(id))
  }

  memberObjects = _.compact(memberObjects)
  const completeResources = []
  for (const resource of resources) {
    const memberInfo = _.find(memberObjects, (o) => _.toNumber(o.userId) === _.toNumber(resource.memberId))
    if (memberInfo) {
      const completeResource = {
        ...resource,
        rating: (memberInfo && memberInfo.maxRating) ? memberInfo.maxRating.rating : 0,
        memberHandle: memberInfo.handle
      }
      completeResources.push(completeResource)
    } else {
      // logger.warn(`memberInfo not found in db for memberId [${resource.memberId}]}`)
      completeResources.push(resource)
    }
  }

  return {
    data: completeResources,
    total: docs.hits.total,
    page,
    perPage
  }
}

getResources.schema = {
  currentUser: Joi.any(),
  challengeId: Joi.id(),
  roleId: Joi.optionalId(),
  page: Joi.page(),
  perPage: Joi.perPage(),
  sortBy: Joi.string().valid('memberHandle', 'created').required(),
  sortOrder: Joi.string().valid('desc', 'asc').required()
}

/**
 * Get member information using v3 API
 * @param {String} memberHandle the member handle
 * @returns {String} the member id and member handle
 */
// async function getMemberInfo (memberHandle) {
//   const member = await helper.getMemberByHandle(memberHandle)
//   if (member) return { memberId: member.userId, handle: member.handle }
// return
// }

/**
 * Get the resource role.
 * @param {String} roleId the resource role id
 * @param {Boolean} isCreated the flag indicate it is create operation.
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
 * Perform initialization. It will validate the input parameters(memberHandle, roleId and phase dependencies),
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
  const challengeRes = await helper.getRequest(`${config.CHALLENGE_API_URL}/${challengeId}`)
  const challenge = challengeRes.body

  // Prevent from creating more than 1 submitter resources on tasks
  if (_.get(challenge, 'task.isTask', false) && isCreated && resource.roleId === config.SUBMITTER_RESOURCE_ROLE_ID) {
    const existing = await getResources(currentUser, challengeId, config.SUBMITTER_RESOURCE_ROLE_ID, 1, 1)
    if (_.find(existing.data, r => r.roleId === config.SUBMITTER_RESOURCE_ROLE_ID)) {
      throw new errors.ConflictError(`The Task is already assigned`)
    }
  }

  // logger.error(`Init Member for ${JSON.stringify(currentUser)}`)
  // get member information using v3 API
  const handle = resource.memberHandle
  const memberId = await helper.getMemberIdByHandle(resource.memberHandle)

  // ensure resource role existed
  const resourceRole = await getResourceRole(resource.roleId, isCreated)

  // perform access validation
  let resources
  // Verify the member has agreed to the challenge terms
  if (isCreated) {
    await helper.checkAgreedTerms(memberId, _.filter(_.get(challenge, 'terms', []), t => t.roleId === resourceRole.id))
  }
  if (!currentUser.isMachine && !helper.hasAdminRole(currentUser)) {
    // Check if user has agreed to the challenge terms
    resources = await helper.query('Resource', { challengeId })
    if (!resourceRole.selfObtainable || _.toString(memberId) !== _.toString(currentUser.userId)) {
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
  // skip phase dependency checks for tasks
  if (_.get(challenge, 'task.isTask', false)) {
    return { resources, memberId, handle }
  }
  // bypass phase dependency checks if the caller is an m2m/admin
  if (currentUser.isMachine || helper.hasAdminRole(currentUser)) {
    return { resources, memberId, handle }
  }
  // check phases dependencies
  const dependencies = await ResourceRolePhaseDependencyService.getDependencies({ resourceRoleId: resource.roleId })
  _.forEach(dependencies, (dependency) => {
    const phase = _.find(challenge.phases, (p) => p.phaseId === dependency.phaseId)
    if (phase) {
      let isOpen = phase.isOpen
      if (_.isNil(isOpen)) {
        isOpen = phase.actualStartDate && phase.actualEndDate &&
          moment(phase.actualStartDate).utc() <= moment().utc() && moment().utc() <= moment(phase.actualEndDate).utc()
      }
      if (_.isNil(isOpen)) {
        isOpen = phase.scheduledStartDate && phase.scheduledEndDate &&
        moment(phase.scheduledStartDate).utc() <= moment().utc() && moment().utc() <= moment(phase.scheduledEndDate).utc()
      }
      if (_.isNil(isOpen)) {
        isOpen = false
      }
      if (!_.isEqual(isOpen, dependency.phaseState)) {
        throw new errors.BadRequestError(`Phase ${dependency.phaseId} should ${
          dependency.phaseState ? 'be open' : 'not be open'
        }`)
      }
    }
  })

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

    // handle doesn't change in current version
    // Seems we don't need handle auto-correction(e.g. "THomaskranitsas"->"thomaskranitsas")
    // const { resources, memberId, handle } = await init(currentUser, challengeId, resource, true)
    const { resources, memberId } = await init(currentUser, challengeId, resource, true)

    // if (handle) {
    //  resource.memberHandle = handle
    // }

    if (_.reduce(resources,
      (result, r) => _.toString(r.memberId) === _.toString(memberId) && r.roleId === resource.roleId ? true : result,
      false)) {
      throw new errors.ConflictError(`User ${resource.memberHandle} already has resource with roleId: ${resource.roleId} in challenge: ${challengeId}`)
    }

    // logger.warn(JSON.stringify(currentUser))

    const ret = await helper.create('Resource', _.assign({
      id: uuid(),
      memberId,
      created: moment().utc().format(),
      createdBy: currentUser.handle || currentUser.sub
    }, resource))

    // Create resources in ES
    const esClient = await helper.getESClient()
    await esClient.create({
      index: config.ES.ES_INDEX,
      type: config.ES.ES_TYPE,
      id: ret.id,
      body: _.pick(ret, payloadFields),
      refresh: 'true' // refresh ES so that it is visible for read operations instantly
    })

    logger.debug(`Created resource: ${JSON.stringify(_.pick(ret, payloadFields))}`)
    await helper.postEvent(config.RESOURCE_CREATE_TOPIC, _.pick(ret, payloadFields))

    return ret
  } catch (err) {
    logger.error(`Create Resource Error ${JSON.stringify(err)}`)
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
      (result, r) => _.toString(r.memberId) === _.toString(memberId) && r.roleId === resource.roleId ? r : result,
      undefined)

    if (!ret) {
      throw new errors.NotFoundError(`User ${handle || resource.memberHandle} doesn't have resource with roleId: ${resource.roleId} in challenge ${challengeId}`)
    }

    await ret.delete()

    // delete from ES
    const esClient = await helper.getESClient()
    await esClient.delete({
      index: config.ES.ES_INDEX,
      type: config.ES.ES_TYPE,
      id: ret.id,
      refresh: 'true' // refresh ES so that it is effective for read operations instantly
    })

    logger.debug(`Deleted resource, posting to Bus API: ${JSON.stringify(_.pick(ret, payloadFields))}`)
    await helper.postEvent(config.RESOURCE_DELETE_TOPIC, _.pick(ret, payloadFields))
    return ret
  } catch (err) {
    logger.error(`Delete Resource Error ${JSON.stringify(err)}`)
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
 * @param {Object} criteria the criteria: {resourceRoleId, page, perPage}
 * @returns {Array} an array of challenge ids represents challenges that given member has access to.
 */
async function listChallengesByMember (memberId, criteria) {
  // removing this call. If a member doesn't exist, it won't find any challenges
  // const res = await helper.getRequest(`${config.USER_API_URL}?filter=id=${memberId}`)
  // if (_.get(res, 'body.result.content').length === 0) {
  //   throw new errors.BadRequestError(`User with id: ${memberId} doesn't exist`)
  // }

  const boolQuery = []
  const mustQuery = []
  const perPage = criteria.perPage
  const page = criteria.page
  boolQuery.push({ match_phrase: { memberId } })
  if (criteria.resourceRoleId) boolQuery.push({ match_phrase: { roleId: criteria.resourceRoleId } })

  mustQuery.push({
    bool: {
      filter: boolQuery
    }
  })

  const esQuery = {
    index: config.get('ES.ES_INDEX'),
    type: config.get('ES.ES_TYPE'),
    size: perPage,
    from: perPage * (page - 1), // Es Index starts from 0
    body: {
      query: {
        bool: {
          must: mustQuery
          // must_not: mustNotQuery
        }
      }
    }
  }
  // logger.warn(`esQuery ${JSON.stringify(esQuery)}`)

  const esClient = await helper.getESClient()
  let docs
  try {
    docs = await esClient.search(esQuery)
  } catch (e) {
    // Catch error when the ES is fresh and has no data
    logger.info(`Query Error from ES ${JSON.stringify(e)}`)
    docs = {
      hits: {
        total: 0,
        hits: []
      }
    }
  }
  // Extract data from hits
  let result = _.map(docs.hits.hits, item => item._source)
  const arr = _.uniq(_.map(result, 'challengeId'))
  return {
    data: arr,
    total: docs.hits.total,
    page,
    perPage
  }
}

listChallengesByMember.schema = {
  memberId: Joi.string().required(),
  criteria: Joi.object().keys({
    resourceRoleId: Joi.string().uuid(),
    page: Joi.page(),
    perPage: Joi.perPage()
  }).required()
}

module.exports = {
  getResources,
  createResource,
  deleteResource,
  listChallengesByMember
}

logger.buildService(module.exports)
