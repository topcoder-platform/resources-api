/**
 * This file defines helper methods
 */

const _ = require("lodash");
const config = require("config");
const querystring = require("querystring");
const request = require("superagent");
const constants = require("../../app-constants");
const models = require("../model/index");
const { MemberProfile, MemberStats } = require("../model/index");
const errors = require("./errors");
const logger = require("./logger");
const m2mAuth = require("tc-core-library-js").auth.m2m;
const AWS = require("aws-sdk");
const elasticsearch = require("elasticsearch");
const m2m = m2mAuth(
  _.pick(config, [
    "AUTH0_URL",
    "AUTH0_AUDIENCE",
    "TOKEN_CACHE_TIME",
    "AUTH0_PROXY_SERVER_URL",
  ])
);
const busApi = require("tc-bus-api-wrapper");
const busApiClient = busApi(
  _.pick(config, [
    "AUTH0_URL",
    "AUTH0_AUDIENCE",
    "TOKEN_CACHE_TIME",
    "AUTH0_CLIENT_ID",
    "AUTH0_CLIENT_SECRET",
    "BUSAPI_URL",
    "KAFKA_ERROR_TOPIC",
    "AUTH0_PROXY_SERVER_URL",
  ])
);

// Elasticsearch client
let esClient;

/**
 * Check the error is custom error.
 * @returns {Boolean} true if error is custom error, false otherwise
 */
function isCustomError(err) {
  return _.keys(errors).includes(err.name);
}

/**
 * Send Kafka event message
 * @params {String} topic the topic name
 * @params {Object} payload the payload
 */
async function postEvent(topic, payload) {
  logger.info(`Publish event to Kafka topic ${topic}`);
  const message = {
    topic,
    originator: config.KAFKA_MESSAGE_ORIGINATOR,
    timestamp: new Date().toISOString(),
    "mime-type": "application/json",
    payload,
  };
  await busApiClient.postEvent(message);
}

/**
 * Wrap async function to standard express function
 * @param {Function} fn the async function
 * @returns {Function} the wrapped function
 */
function wrapExpress(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
}

/**
 * Wrap all functions from object
 * @param obj the object (controller exports)
 * @returns {Object|Array} the wrapped object
 */
function autoWrapExpress(obj) {
  if (_.isArray(obj)) {
    return obj.map(autoWrapExpress);
  }
  if (_.isFunction(obj)) {
    if (obj.constructor.name === "AsyncFunction") {
      return wrapExpress(obj);
    }
    return obj;
  }
  _.each(obj, (value, key) => {
    obj[key] = autoWrapExpress(value);
  });
  return obj;
}

/**
 * Check if the user has admin role
 * @param {Object} authUser the user
 */
function hasAdminRole(authUser) {
  for (let i = 0; i < authUser.roles.length; i++) {
    if (
      authUser.roles[i].toLowerCase() ===
      constants.UserRoles.Admin.toLowerCase()
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Check if exists.
 *
 * @param {Array} source the array in which to search for the term
 * @param {Array | String} term the term to search
 */
function checkIfExists(source, term) {
  let terms;

  if (!_.isArray(source)) {
    throw new Error("Source argument should be an array");
  }

  source = source.map((s) => s.toLowerCase());

  if (_.isString(term)) {
    terms = term.split(" ");
  } else if (_.isArray(term)) {
    terms = term.map((t) => t.toLowerCase());
  } else {
    throw new Error("Term argument should be either a string or an array");
  }

  for (let i = 0; i < terms.length; i++) {
    if (source.includes(terms[i])) {
      return true;
    }
  }

  return false;
}

/**
 * Get Data by model id
 * @param {Object} modelName The dynamoose model name
 * @param {String} id The id value
 * @returns {Promise<void>}
 */
async function getById(modelName, id) {
  return new Promise((resolve, reject) => {
    models[modelName]
      .query("id")
      .eq(id)
      .exec((err, result) => {
        if (err) {
          return reject(err);
        }
        if (result.length > 0) {
          return resolve(result[0]);
        } else {
          return reject(
            new errors.NotFoundError(
              `${modelName} with id: ${id} doesn't exist`
            )
          );
        }
      });
  });
}

/**
 * Get Member by memberId
 * @param {Number} id The id value
 * @returns {Promise<void>}
 */
async function getMemberInfoById(id) {
  // logger.warn('getMemberInfoById')
  const memberInfo = await MemberStats.query("userId")
    .eq(id)
    .exec()
    .then((r) => r[0]);
  return memberInfo;
}

/**
 * Get Data by model id
 * @param {String} handle The member handle
 * @returns {Promise<void>}
 */
async function getMemberIdByHandle(handle) {
  const results = await getRequest(`${config.MEMBER_API_URL}/${handle}`, {})
  return results.body.userId;
}


/**
 * Create item in database
 * @param {Object} modelName The dynamoose model name
 * @param {Object} data The create data object
 * @returns {Promise<void>}
 */
async function create(modelName, data) {
  return new Promise((resolve, reject) => {
    const dbItem = new models[modelName](data);
    dbItem.save((err) => {
      if (err) {
        return reject(err);
      }

      return resolve(dbItem);
    });
  });
}

/**
 * Update item in database
 * @param {Object} dbItem The Dynamo database item
 * @param {Object} data The updated data object
 * @returns {Promise<void>}
 */
async function update(dbItem, data) {
  Object.keys(data).forEach((key) => {
    dbItem[key] = data[key];
  });
  return new Promise((resolve, reject) => {
    dbItem.save((err) => {
      if (err) {
        return reject(err);
      }

      return resolve(dbItem);
    });
  });
}

/**
 * Get data collection by scan parameters
 * @param {Object} modelName The dynamoose model name
 * @param {Object} scanParams The scan parameters object
 * @returns {Promise<void>}
 */
async function scan(modelName, scanParams) {
  return new Promise((resolve, reject) => {
    models[modelName]
      .scan(scanParams)
      .all(0, 0)
      .exec((err, result) => {
        if (err) {
          return reject(err);
        }

        return resolve(result.count === 0 ? [] : result);
      });
  });
}

/**
 * Get all data collection (avoid default page limit of DynamoDB) by scan parameters
 * @param {Object} modelName The dynamoose model name
 * @param {Object} scanParams The scan parameters object
 * @returns {Array}
 */
async function scanAll(modelName, scanParams) {
  let results = await models[modelName].scan(scanParams).exec();
  let lastKey = results.lastKey;
  while (!_.isUndefined(results.lastKey)) {
    const newResult = await models[modelName]
      .scan(scanParams)
      .startAt(lastKey)
      .exec();
    results = [...results, ...newResult];
    lastKey = newResult.lastKey;
  }
  return results;
}

/**
 * Get data collection by query parameters
 * @param {Object} modelName The dynamoose model name
 * @param {Object} queryParams The query parameters object
 * @returns {Promise<void>}
 */
async function query(modelName, queryParams) {
  return new Promise((resolve, reject) => {
    models[modelName]
      .query(queryParams)
      .all(0, 0)
      .exec((err, result) => {
        if (err) {
          return reject(err);
        }

        return resolve(result.count === 0 ? [] : result);
      });
  });
}

/**
 * Check duplication of specified model
 * @param {Object} modelName The dynamoose model name
 * @param {Object} queryParams The query parameters object
 * @param {String} errorMessage the error message if duplication exist.
 * @returns {Boolean} true if duplication exist, false otherwise.
 */
async function validateDuplicate(modelName, queryParams, errorMessage) {
  const list = await query(modelName, queryParams);
  if (list.length > 0) {
    throw new errors.ConflictError(errorMessage);
  }
}

/**
 * Uses superagent to proxy get request
 * @param {String} url the url
 * @param {Object} query the query parameters, optional
 * @returns {Object} the response
 */
async function getRequest(url, query) {
  const m2mToken = await m2m.getMachineToken(
    config.AUTH0_CLIENT_ID,
    config.AUTH0_CLIENT_SECRET
  );

  return request
    .get(url)
    .set("Authorization", `Bearer ${m2mToken}`)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .query(query || {});
}

/**
 * Uses superagent to proxy post request
 * @param {String} url the url
 * @param {Object} data the query parameters, optional
 * @returns {Object} the response
 */
async function postRequest(url, data) {
  const m2mToken = await m2m.getMachineToken(
    config.AUTH0_CLIENT_ID,
    config.AUTH0_CLIENT_SECRET
  );

  return request
    .post(url)
    .set("Authorization", `Bearer ${m2mToken}`)
    .set("Content-Type", "application/json")
    .set("Accept", "application/json")
    .send(data);
}

/**
 * Get link for a given page.
 * @param {Object} req the HTTP request
 * @param {Number} page the page number
 * @returns {String} link for the page
 */
function getPageLink(req, page) {
  const q = _.assignIn({}, req.query, { page });
  return `${config.API_BASE_URL}${req.path}?${querystring.stringify(q)}`;
}

/**
 * Set HTTP response headers from result.
 * @param {Object} req the HTTP request
 * @param {Object} res the HTTP response
 * @param {Object} result the operation result
 */
function setResHeaders(req, res, result) {
  const totalPages = Math.ceil(result.total / result.perPage);
  if (parseInt(result.page, 10) > 1) {
    res.set("X-Prev-Page", parseInt(result.page, 10) - 1);
  }
  if (parseInt(result.page, 10) < totalPages) {
    res.set("X-Next-Page", parseInt(result.page, 10) + 1);
  }
  res.set("X-Page", parseInt(result.page, 10));
  res.set("X-Per-Page", result.perPage);
  res.set("X-Total", result.total);
  res.set("X-Total-Pages", totalPages);
  // set Link header
  if (totalPages > 0) {
    let link = `<${getPageLink(req, 1)}>; rel="first", <${getPageLink(
      req,
      totalPages
    )}>; rel="last"`;
    if (parseInt(result.page, 10) > 1) {
      link += `, <${getPageLink(
        req,
        parseInt(result.page, 10) - 1
      )}>; rel="prev"`;
    }
    if (parseInt(result.page, 10) < totalPages) {
      link += `, <${getPageLink(
        req,
        parseInt(result.page, 10) + 1
      )}>; rel="next"`;
    }
    res.set("Link", link);
  }
}

/**
 * Get all pages from TC API.
 * @param {String} url the url
 * @param {Object} query the query parameters, optional, it should not include page and perPage
 * @returns {Array} the result records
 */
async function getAllPages(url, query) {
  const perPage = 100;
  let page = 1;
  let result = [];
  for (;;) {
    // get current page data
    const res = await getRequest(
      url,
      _.assignIn({ page, perPage }, query || {})
    );
    if (!_.isArray(res.body) || res.body.length === 0) {
      break;
    }
    result = _.concat(result, res.body);
    if (res.headers["x-total"]) {
      const total = Number(res.headers["x-total"]);
      if (page * perPage >= total) {
        break;
      }
    }
    // increment page
    page += 1;
  }
  return result;
}

/**
 * Get ES Client
 * @return {Object} Elasticsearch Client Instance
 */
function getESClient() {
  if (esClient) {
    return esClient;
  }
  const esHost = config.get("ES.HOST");
  // AWS ES configuration is different from other providers
  if (/.*amazonaws.*/.test(esHost)) {
    esClient = elasticsearch.Client({
      apiVersion: config.get("ES.API_VERSION"),
      hosts: esHost,
      connectionClass: require("http-aws-es"), // eslint-disable-line global-require
      amazonES: {
        region: config.get("DYNAMODB.AWS_REGION"),
        credentials: new AWS.EnvironmentCredentials("AWS"),
      },
    });
  } else {
    esClient = new elasticsearch.Client({
      apiVersion: config.get("ES.API_VERSION"),
      hosts: esHost,
    });
  }
  return esClient;
}

/**
 * Check if the user has agreed to all challenge terms
 * @param {Number} userId the user ID
 * @param {Array<String>} terms an array of term UUIDs to check
 */
async function checkAgreedTerms(userId, terms) {
  const unAgreedTerms = [];
  const missingTerms = [];
  for (const term of terms) {
    const res = await getRequest(`${config.TERMS_API_URL}/${term.id}`, {
      userId,
    });
    if (!_.get(res, "body.agreed", false)) {
      unAgreedTerms.push(_.get(res, "body.title", term));
      missingTerms.push({
        termId: term.id,
        roleId: term.roleId,
      });
    }
  }

  if (unAgreedTerms.length > 0) {
    throw new errors.ForbiddenError(
      `The user has not yet agreed to the following terms: [${unAgreedTerms.join(
        ", "
      )}]`,
      null,
      { missingTerms }
    );
  }
}

module.exports = {
  wrapExpress,
  autoWrapExpress,
  getMemberInfoById,
  getMemberIdByHandle,
  checkIfExists,
  hasAdminRole,
  getById,
  create,
  update,
  query,
  scan,
  scanAll,
  validateDuplicate,
  getRequest,
  postEvent,
  isCustomError,
  setResHeaders,
  getAllPages,
  getESClient,
  checkAgreedTerms,
  postRequest,
};
