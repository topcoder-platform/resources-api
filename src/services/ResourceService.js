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
const constants = require('../../app-constants')

const payloadFields = ['id', 'challengeId', 'memberId', 'memberHandle', 'roleId', 'created', 'createdBy', 'updated', 'updatedBy', 'legacyId']
const PURE_V5_CHALLENGE_TEMPLATE_IDS = config.get('PURE_V5_CHALLENGE_TEMPLATE_IDS')

/**
 * Check whether the user can access resources
 * @param {Array} resources resources of current user for specified challenge id
 */
async function checkAccess (currentUserResources) {
  const list = await helper.scan('ResourceRole')
  const fullAccessRoles = []
  _.each(list, e => {
    if (e.isActive && e.fullReadAccess && e.fullWriteAccess) {
      fullAccessRoles.push(e.id)
    }
  })
  if (_.isEmpty(_.intersectionWith(currentUserResources, fullAccessRoles, (a, b) => a.roleId === b))) {
    throw new errors.ForbiddenError(`Only M2M, admin or user with full access role can perform this action`)
  }
}

/**
 * Get resources with given challenge id.
 * @param {Object} currentUser the current user
 * @param {String} challengeId the challenge id
 * @param {String} roleId the role id to filter on
 * @param {String} memberId the member id
 * @param {String} memberHandle the member handle
 * @param {Number} page The page number
 * @param {Number} perPage The number of items to list per page
 * @param {Number} sortBy The field that becomes the sorting criteria
 * @param {Number} sortOrder The sort order
 * @returns {Object} the search result
 */
async function getResources (currentUser, challengeId, roleId, memberId, memberHandle, page, perPage, sortBy, sortOrder) {
  page = page || 1
  perPage = perPage || config.DEFAULT_PAGE_SIZE
  sortBy = sortBy || 'created'
  sortOrder = sortOrder || 'asc'
  logger.debug(`getResources ${JSON.stringify([currentUser, challengeId, roleId, memberId, memberHandle, page, perPage, sortBy, sortOrder])}`)
  if (!challengeId && !memberId && !memberHandle) {
    throw new errors.BadRequestError('At least one of the following parameters is required: [challengeId, memberId, memberHandle]')
  }
  if (challengeId && !validateUUID(challengeId)) {
    throw new errors.BadRequestError(`Challenge ID ${challengeId} must be a valid v5 Challenge Id (UUID)`)
  }
  if (challengeId) {
    try {
      // Verify that the challenge exists
      await helper.getRequest(`${config.CHALLENGE_API_URL}/${challengeId}`, { checkIfExists: 'true' })
    } catch (e) {
      throw new errors.NotFoundError(`Challenge ID ${challengeId} not found`)
    }
  }

  const boolQuery = []
  const mustQuery = []
  let hasFullAccess

  // Check if the user has a resource with full access on the challenge
  if (currentUser && !currentUser.isMachine && !helper.hasAdminRole(currentUser)) {
    if (challengeId) {
      const resources = await helper.query('Resource', {
        hash: { challengeId: { eq: challengeId } },
        range: { memberId: { eq: currentUser.userId } }
      })
      try {
        await checkAccess(resources)
        hasFullAccess = true
      } catch (e) {
        hasFullAccess = false
      }
    }
    if (memberId && _.toString(memberId) !== _.toString(currentUser.userId)) {
      throw new errors.ForbiddenError('You are not allowed to perform this operation!')
    }
    if (memberHandle && memberHandle !== currentUser.handle) {
      throw new errors.ForbiddenError('You are not allowed to perform this operation!')
    }
  }

  if (challengeId) {
    boolQuery.push({ match_phrase: { challengeId } })
  } else if (!currentUser) {
    throw new errors.ForbiddenError('You are not allowed to perform this operation!')
  }

  if (!currentUser) {
    // if the user is not logged in, only return resources with submitter role ID
    boolQuery.push({ match_phrase: { roleId: config.SUBMITTER_RESOURCE_ROLE_ID } })
  } else if (!currentUser.isMachine && !helper.hasAdminRole(currentUser) && !hasFullAccess) {
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
  } else {
    if (roleId) {
      boolQuery.push({ match_phrase: { roleId } })
    }
    if (memberId) {
      boolQuery.push({ match_phrase: { memberId } })
    } else if (memberHandle) {
      boolQuery.push({ match_phrase: { memberHandle } })
    }
  }

  mustQuery.push({
    bool: {
      filter: boolQuery
    }
  })

  const sortCriteria = [{ [sortBy]: { 'order': sortOrder } }]
  const docs = await searchES(mustQuery, perPage, page, sortCriteria)

  // Extract data from hits
  const allResources = _.map(docs.hits.hits, item => item._source)
  const resources = _.map(allResources, item => ({ ...item, memberId: (_.toString(item.memberId)) }))

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
  challengeId: Joi.optionalId(),
  roleId: Joi.optionalId(),
  memberId: Joi.string(),
  memberHandle: Joi.string(),
  page: Joi.page().default(1),
  perPage: Joi.perPage().default(config.DEFAULT_PAGE_SIZE),
  sortBy: Joi.string().valid('memberHandle', 'created').default('created'),
  sortOrder: Joi.string().valid('desc', 'asc').default('asc')
}

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

  if (_.get(challenge, 'status') === constants.ChallengeStatuses.Completed && !isCreated) {
    throw new errors.BadRequestError('Cannot delete resources of a completed challenge!')
  }

  if (!_.get(challenge, 'task.isTask', false) && _.get(challenge, 'status') !== constants.ChallengeStatuses.Active && isCreated && resource.roleId === config.SUBMITTER_RESOURCE_ROLE_ID) {
    throw new errors.BadRequestError(`Cannot create submitter resource on challenge with status ${_.get(challenge, 'status')}`)
  }

  const allResources = await helper.query('Resource', { challengeId })

  const registrationPhase = challenge.phases.find((phase) => phase.name === 'Registration')
  const currentSubmitters = _.filter(allResources, (r) => r.roleId === config.SUBMITTER_RESOURCE_ROLE_ID)
  const handle = resource.memberHandle
  const userResources = allResources.filter((r) => _.toLower(r.memberHandle) === _.toLower(handle))
  // Retrieve the constraint - Allowed Registrants
  if (isCreated && resource.roleId === config.SUBMITTER_RESOURCE_ROLE_ID) {
    const allowedRegistrants = _.get(challenge, 'constraints.allowedRegistrants')
    // enforce the allowed Registrants constraint
    if (
      _.isArray(allowedRegistrants) &&
      !_.isEmpty(allowedRegistrants) &&
      !_.some(
        allowedRegistrants,
        (allowed) => _.toLower(allowed) === _.toLower(handle)
      )
    ) {
      throw new errors.ConflictError(
        `User ${resource.memberHandle} is not allowed to register.`
      )
    }
    if (!_.get(challenge, 'task.isTask', false) && (_.toLower(challenge.createdBy) === _.toLower(handle) ||
      _.some(userResources, r => r.roleId === config.REVIEWER_RESOURCE_ROLE_ID || r.roleId === config.ITERATIVE_REVIEWER_RESOURCE_ROLE_ID))) {
      throw new errors.BadRequestError(
        `User ${resource.memberHandle} is not allowed to register.`
      )
    }
  }

  // Prevent from creating more than 1 submitter resources on tasks
  const isTask = _.get(challenge, 'task.isTask', false)

  // TODO: remove this check after all challenges are migrated to v5 and the flag task.isTask is removed in favor of using challenge.templateId
  const isPureV5Challenge = PURE_V5_CHALLENGE_TEMPLATE_IDS.indexOf(_.get(challenge, 'timelineTemplateId', null)) === -1

  if (!isPureV5Challenge && isTask && isCreated && resource.roleId === config.SUBMITTER_RESOURCE_ROLE_ID) {
    if (currentSubmitters.length > 0) {
      throw new errors.ConflictError(`The Task is already assigned`)
    }
  }

  const currentUserResources = allResources.filter((r) => _.toString(r.memberId) === _.toString(currentUser.userId))
  const isResourceExist = !_.isUndefined(_.find(userResources, r => r.roleId === resource.roleId))
  if (isCreated && isResourceExist) {
    throw new errors.ConflictError(`User ${resource.memberHandle} already has resource with roleId: ${resource.roleId} in challenge: ${challengeId}`)
  }

  if (!isCreated && !isResourceExist) {
    throw new errors.NotFoundError(`User ${handle} doesn't have resource with roleId: ${resource.roleId} in challenge ${challengeId}`)
  }

  const { memberId, email } = await helper.getMemberDetailsByHandle(handle)
  // check if the resource is reviewer role and has already made a submission in the challenge
  if (isCreated && (resource.roleId === config.REVIEWER_RESOURCE_ROLE_ID || resource.roleId === config.ITERATIVE_REVIEWER_RESOURCE_ROLE_ID)) {
    const submissionsRes = await helper.getRequest(`${config.SUBMISSIONS_API_URL}`, { challengeId: challengeId, perPage: 100, memberId: memberId })
    const submissions = submissionsRes.body
    if (submissions.length !== 0) {
      throw new errors.ConflictError(`The member has already submitted to the challenge and cannot have a Reviewer or Iterative Reviewer role`)
    }
  }

  // ensure resource role existed
  const resourceRole = await getResourceRole(resource.roleId, isCreated)

  // Verify the member has agreed to the challenge terms
  if (isCreated) {
    await helper.checkAgreedTerms(memberId, _.filter(_.get(challenge, 'terms', []), t => t.roleId === resourceRole.id))
  }
  if (!currentUser.isMachine && !helper.hasAdminRole(currentUser)) {
    // Check if user has agreed to the challenge terms
    if (!_.get(challenge, 'legacy.selfService')) {
      if (!resourceRole.selfObtainable || _.toString(memberId) !== _.toString(currentUser.userId)) {
        // if user is not creating/deleting a self obtainable resource for itself
        // we need to perform check access first
        await checkAccess(currentUserResources)
      }
    }
  }

  let closeRegistration = false
  if (isCreated && registrationPhase && challenge.legacy != null && challenge.legacy.subTrack === 'FIRST_2_FINISH') {
    const isPastScheduledEndDate = moment().utc() > moment(registrationPhase.scheduledEndDate).utc()
    closeRegistration = registrationPhase.isOpen && isPastScheduledEndDate && resource.roleId === config.SUBMITTER_RESOURCE_ROLE_ID
  }

  // skip phase dependency checks for tasks
  if (_.get(challenge, 'task.isTask', false)) {
    return { allResources, userResources, memberId, handle, email, challenge, closeRegistration }
  }

  // bypass phase dependency checks if the caller is an m2m/admin
  if (currentUser.isMachine || helper.hasAdminRole(currentUser)) {
    return { allResources, userResources, memberId, handle, email, challenge, closeRegistration }
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
  return { allResources, userResources, memberId, handle, email, challenge, closeRegistration }
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

    const { memberId, handle, email, challenge, closeRegistration } = await init(currentUser, challengeId, resource, true)

    const ret = await helper.create('Resource', _.assign({
      id: uuid(),
      memberId,
      created: moment().utc().format(),
      createdBy: currentUser.handle || currentUser.sub
    }, resource))

    const eventPayload = _.pick(ret, payloadFields)
    // Create resources in ES
    const esClient = await helper.getESClient()
    await esClient.create({
      index: config.ES.ES_INDEX,
      type: config.ES.ES_TYPE,
      id: ret.id,
      body: eventPayload,
      refresh: 'true' // refresh ES so that it is visible for read operations instantly
    })
    await helper.sendHarmonyEvent('CREATE', 'Resource', eventPayload, _.get(challenge, 'billing.billingAccountId'))

    logger.debug(`Created resource: ${JSON.stringify(eventPayload)}`)
    await helper.postEvent(config.RESOURCE_CREATE_TOPIC, eventPayload)
    if (!_.get(challenge, 'task.isTask', false) && resource.roleId === config.SUBMITTER_RESOURCE_ROLE_ID) {
      const forumUrl = _.get(challenge, 'discussions[0].url')
      let templateId = config.REGISTRATION_EMAIL.SENDGRID_TEMPLATE_ID
      if (_.isUndefined(forumUrl)) {
        templateId = config.REGISTRATION_EMAIL.SENDGRID_TEMPLATE_ID_NO_FORUM
      }
      await helper.postEvent(config.EMAIL_NOTIFICATIN_TOPIC, {
        from: config.REGISTRATION_EMAIL.EMAIL_FROM,
        replyTo: config.REGISTRATION_EMAIL.EMAIL_FROM,
        recipients: [email],
        data: {
          handle,
          challengeName: challenge.name,
          forum: forumUrl,
          submissionEndTime: new Date(_.get(_.find(challenge.phases, phase => phase.name === 'Submission'), 'scheduledEndDate')).toUTCString(),
          submitUrl: _.replace(config.REGISTRATION_EMAIL.SUBMIT_URL, ':id', challengeId),
          reviewAppUrl: config.REGISTRATION_EMAIL.REVIEW_APP_URL + challenge.legacyId,
          helpUrl: config.REGISTRATION_EMAIL.HELP_URL,
          support: config.REGISTRATION_EMAIL.SUPPORT_EMAIL
        },
        sendgrid_template_id: templateId,
        version: 'v3'
      })
    }

    if (closeRegistration) {
      logger.info(`Closing registration phase for challenge ${challengeId}`)
      const response = await helper.advanceChallengePhase(challengeId, 'Registration', 'close')
      logger.info(`Closed registration phase for challenge ${challengeId} with response ${JSON.stringify(response)}`)
    }

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

    const { allResources, memberId, handle, challenge } = await init(currentUser, challengeId, resource)

    const ret = _.reduce(allResources,
      (result, r) => _.toString(r.memberId) === _.toString(memberId) && r.roleId === resource.roleId ? r : result,
      undefined)

    if (!ret) {
      throw new errors.NotFoundError(`User ${handle} doesn't have resource with roleId: ${resource.roleId} in challenge ${challengeId}`)
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
    await helper.sendHarmonyEvent('DELETE', 'Resource', { id: ret.id, roleId: ret.roleId, challengeId }, _.get(challenge, 'billing.billingAccountId'))
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
  const boolQuery = []
  const mustQuery = []
  const perPage = criteria.perPage || config.DEFAULT_PAGE_SIZE
  const page = criteria.page || 1
  boolQuery.push({ match_phrase: { memberId } })
  if (criteria.resourceRoleId) boolQuery.push({ match_phrase: { roleId: criteria.resourceRoleId } })

  mustQuery.push({
    bool: {
      filter: boolQuery
    }
  })

  let docs = {
    hits: {
      total: 0,
      hits: []
    }
  }

  if (criteria.useScroll) {
    docs = await searchESWithScroll(mustQuery)
  } else if (perPage * page <= config.MAX_ELASTIC_SEARCH_RECORDS_SIZE) {
    docs = await searchES(mustQuery, perPage, page)
  } else {
    throw new errors.BadRequestError(`
      ES pagination params:
      page ${page},
      perPage: ${perPage}
      exceeds the max search window:${config.MAX_ELASTIC_SEARCH_RECORDS_SIZE}`
    )
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
    page: Joi.page().default(1),
    perPage: Joi.perPage().default(config.DEFAULT_PAGE_SIZE),
    useScroll: Joi.boolean().default(false)
  }).required()
}

async function searchESWithScroll (mustQuery) {
  const scrollTimeout = '1m'
  const esQuery = {
    index: config.get('ES.ES_INDEX'),
    type: config.get('ES.ES_TYPE'),
    size: 10000,
    body: {
      query: {
        bool: {
          must: mustQuery
        }
      }
    },
    scroll: scrollTimeout
  }

  const esClient = await helper.getESClient()
  const searchResponse = await esClient.search(esQuery)

  // eslint-disable-next-line camelcase
  const { _scroll_id, hits } = searchResponse
  const totalHits = hits.total

  // eslint-disable-next-line camelcase
  let scrollId = _scroll_id

  while (hits.hits.length < totalHits) {
    const nextScrollResponse = await esClient.scroll({
      scroll: scrollTimeout,
      scroll_id: scrollId
    })

    scrollId = nextScrollResponse._scroll_id
    hits.hits = [...hits.hits, ...nextScrollResponse.hits.hits]
  }

  await esClient.clearScroll({
    body: {
      // eslint-disable-next-line camelcase
      scroll_id: [_scroll_id]
    }
  })

  return {
    hits: {
      total: hits.total,
      hits: hits.hits
    }
  }
}

/**
 * Execute ES query
 * @param {Object} mustQuery the query that will be sent to ES
 * @param {Number} perPage number of search result per page
 * @param {Number} page the current page
 * @returns {Object} doc from ES
 */
async function searchES (mustQuery, perPage, page, sortCriteria) {
  let esQuery
  if (sortCriteria) {
    esQuery = {
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
        sort: sortCriteria
      }
    }
  } else {
    esQuery = {
      index: config.get('ES.ES_INDEX'),
      type: config.get('ES.ES_TYPE'),
      size: perPage,
      from: perPage * (page - 1), // Es Index starts from 0
      body: {
        query: {
          bool: {
            must: mustQuery
          }
        }
      }
    }
  }
  logger.debug(`ES Query ${JSON.stringify(esQuery)}`)
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
  return docs
}

/**
 * Get resource count of a challenge.
 * @param {String} challengeId the challenge id
 * @param {String} roleId the role id to filter on
 * @returns {Object} the search result
 */
async function getResourceCount (challengeId, roleId) {
  logger.debug(`getResourceCount ${JSON.stringify([challengeId, roleId])}`)
  const must = [{ term: { 'challengeId.keyword': challengeId } }]
  if (roleId) {
    must.push({ term: { 'roleId.keyword': roleId } })
  }

  const esQuery = {
    index: config.get('ES.ES_INDEX'),
    type: config.get('ES.ES_TYPE'),
    size: 0,
    body: {
      query: {
        bool: {
          must
        }
      },
      aggs: {
        group_by_roleId: {
          terms: {
            field: 'roleId.keyword'
          }
        }
      }
    }
  }

  const esClient = await helper.getESClient()
  let result
  try {
    result = await esClient.search(esQuery)
  } catch (err) {
    logger.error(`Get Resource Count Error ${JSON.stringify(err)}`)
    throw err
  }
  const response = _.mapValues(_.keyBy(result.aggregations.group_by_roleId.buckets, 'key'), (v) => v.doc_count)
  return response
}

getResourceCount.schema = {
  challengeId: Joi.id(),
  roleId: Joi.optionalId()
}

module.exports = {
  getResources,
  createResource,
  deleteResource,
  listChallengesByMember,
  getResourceCount
}

logger.buildService(module.exports)
