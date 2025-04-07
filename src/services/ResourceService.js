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
const constants = require('../../app-constants')
const prisma = require('../common/prisma').getClient()

const payloadFields = ['id', 'challengeId', 'memberId', 'memberHandle', 'roleId', 'created', 'createdBy', 'updated', 'updatedBy']

/**
 * Check whether the user can access resources
 * @param {Array} resources resources of current user for specified challenge id
 */
async function checkAccess (currentUserResources) {
  const list = await prisma.resourceRole.findMany({})
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
  // convert sortBy to prisma model
  if (sortBy === 'created') {
    sortBy = 'createdAt'
  }
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

  const prismaFilter = { where: { AND: [] } }

  let hasFullAccess

  // Check if the user has a resource with full access on the challenge
  if (currentUser && !currentUser.isMachine && !helper.hasAdminRole(currentUser)) {
    if (challengeId) {
      const resources = await prisma.resource.findMany({
        where: {
          AND: [
            { challengeId },
            { memberId: _.toString(currentUser.userId) }
          ]
        }
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
    prismaFilter.where.AND.push({ challengeId })
  } else if (!currentUser) {
    throw new errors.ForbiddenError('You are not allowed to perform this operation!')
  }

  if (!currentUser) {
    // if the user is not logged in, only return resources with submitter role ID
    prismaFilter.where.AND.push({ roleId: config.SUBMITTER_RESOURCE_ROLE_ID })
  } else if (!currentUser.isMachine && !helper.hasAdminRole(currentUser) && !hasFullAccess) {
    // if not admin, and not machine, only return submitters + all my roles
    prismaFilter.where.AND.push({
      OR: [
        { memberId: _.toString(currentUser.userId) },
        { AND: [
          { roleId: config.SUBMITTER_RESOURCE_ROLE_ID },
          { memberId: { not: _.toString(currentUser.userId) } }
        ] }
      ]
    })
  } else {
    if (roleId) {
      prismaFilter.where.AND.push({ roleId })
    }
    if (memberId) {
      prismaFilter.where.AND.push({ memberId })
    } else if (memberHandle) {
      prismaFilter.where.AND.push({ memberHandle })
    }
  }

  const orderBy = [{ [sortBy]: sortOrder }]
  const total = await prisma.resource.count(prismaFilter)
  const prismaQuery = {
    ...prismaFilter,
    orderBy,
    skip: (page - 1) * perPage,
    take: perPage
  }
  let resources = await prisma.resource.findMany(prismaQuery)
  resources = _.map(resources, item => {
    const ret = _.omit(item, 'updatedBy', 'updatedAt', 'createdAt')
    ret.created = item.createdAt
    return ret
  })

  const memberIds = _.uniq(_.map(resources, r => _.toNumber(r.memberId)))

  let memberObjects = await helper.getMemberInfoByIdList(memberIds)
  logger.info(`Retrieved member objects: ${JSON.stringify(memberObjects)}`)
  const completeResources = []
  for (const resource of resources) {
    const memberInfo = _.find(memberObjects, (o) => _.toNumber(o.userId) === _.toNumber(resource.memberId))
    if (memberInfo) {
      const completeResource = {
        ...resource,
        rating: memberInfo.maxRating,
        memberHandle: memberInfo.handle
      }
      completeResources.push(completeResource)
    } else {
      completeResources.push(resource)
    }
  }

  return {
    data: completeResources,
    total,
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
 * @returns {Promise<Object>} the resource entities and member information.
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

  const allResources = await prisma.resource.findMany({ where: { challengeId } })

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
  if (_.get(challenge, 'task.isTask', false) && isCreated && resource.roleId === config.SUBMITTER_RESOURCE_ROLE_ID) {
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
  const dependencies = await prisma.resourceRolePhaseDependency.findMany({
    where: { resourceRoleId: resource.roleId }
  })
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
      logger.info(`phase status: ${isOpen}`)
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

    const timelineTemplateId = _.get(challenge, 'timelineTemplateId', null)

    const prismaData = _.assign({
      id: uuid(),
      memberId: _.toString(memberId),
      createdBy: helper.getUserHandleOrSub(currentUser),
      createdAt: moment().utc().format()
    }, resource)
    const createdResource = await prisma.resource.create({
      data: prismaData
    })
    let ret = _.pick(createdResource, payloadFields)
    ret.created = createdResource.createdAt
    ret.updated = createdResource.updatedAt

    logger.debug(`Created resource: ${JSON.stringify(ret)}`)
    await helper.postEvent(config.RESOURCE_CREATE_TOPIC, ret)
    if (!_.get(challenge, 'task.isTask', false) && resource.roleId === config.SUBMITTER_RESOURCE_ROLE_ID) {
      const forumUrl = _.get(challenge, 'discussions[0].url')
      let templateId = config.REGISTRATION_EMAIL.SENDGRID_TEMPLATE_ID
      if (_.isUndefined(forumUrl)) {
        templateId = config.REGISTRATION_EMAIL.SENDGRID_TEMPLATE_ID_NO_FORUM
      }
      console.log('challenge template id', timelineTemplateId)
      console.log('config template id', config.get('TOPCROWD_CHALLENGE_TEMPLATE_ID'))
      if (config.get('TOPCROWD_CHALLENGE_TEMPLATE_ID') !== timelineTemplateId) {
        console.log('sending email')
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

    const { allResources, memberId, handle } = await init(currentUser, challengeId, resource)

    let ret = _.reduce(allResources,
      (result, r) => _.toString(r.memberId) === _.toString(memberId) && r.roleId === resource.roleId ? r : result,
      undefined)

    if (!ret) {
      throw new errors.NotFoundError(`User ${handle} doesn't have resource with roleId: ${resource.roleId} in challenge ${challengeId}`)
    }
    ret = {
      ..._.pick(ret, payloadFields),
      created: ret.createdAt,
      updated: ret.updatedAt
    }
    await prisma.resource.deleteMany({ where: { id: ret.id } })

    logger.debug(`Deleted resource, posting to Bus API: ${JSON.stringify(ret)}`)
    await helper.postEvent(config.RESOURCE_DELETE_TOPIC, ret)
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
  const perPage = criteria.perPage || config.DEFAULT_PAGE_SIZE
  const page = criteria.page || 1

  // Only select challengeId
  const selectClause = { select: { challengeId: true } }
  // Build where clause
  const prismaFilter = { where: { AND: [] } }
  prismaFilter.where.AND.push({ memberId: _.toString(memberId) })
  if (criteria.resourceRoleId) {
    prismaFilter.where.AND.push({ roleId: criteria.resourceRoleId })
  }
  // TODO: total count is total resource count, not distinct challengeId count
  const total = await prisma.resource.count(prismaFilter)

  let records = []
  if (criteria.useScroll) {
    records = await prisma.resource.findMany({
      ...selectClause,
      ...prismaFilter
    })
  } else {
    records = await prisma.resource.findMany({
      ...selectClause,
      ...prismaFilter,
      skip: (page - 1) * perPage,
      take: perPage
    })
  }
  // convert to challengeId array and remove duplicated
  const arr = _.uniq(_.map(records, 'challengeId'))
  return {
    data: arr,
    total,
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

/**
 * Get resource count of a challenge.
 * @param {String} challengeId the challenge id
 * @param {String} roleId the role id to filter on
 * @returns {Object} the search result
 */
async function getResourceCount (challengeId, roleId) {
  logger.debug(`getResourceCount ${JSON.stringify([challengeId, roleId])}`)
  const whereClause = { where: { AND: [] } }
  whereClause.where.AND.push({ challengeId })
  if (roleId) {
    whereClause.where.AND.push({ roleId })
  }
  // select roleId, count(id) from resource where challengeId = ? group by roleId
  const groupByRes = await prisma.resource.groupBy({
    ...whereClause,
    by: ['roleId'],
    _count: { id: true }
  })
  const ret = {}
  _.forEach(groupByRes, g => {
    ret[g.roleId] = g._count.id
  })
  return ret
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
