const config = require('config')
const apiTestLib = require('tc-api-testing-lib')
const helper = require('../../src/common/helper')
const logger = require('../../src/common/logger')

const requests = [
  {
    folder: 'create resource role by admin',
    iterationData: require('./testData/resource-role/create-resource-role-by-admin.json')
  },
  {
    folder: 'create resource role by m2m',
    iterationData: require('./testData/resource-role/create-resource-role-by-m2m.json')
  },
  {
    folder: 'create resource role with all kinds of invalid token',
    iterationData: require('./testData/resource-role/create-resource-role-with-invalid-tokens.json')
  },
  {
    folder: 'update resource role by admin',
    iterationData: require('./testData/resource-role/update-resource-role-by-admin.json')
  },
  {
    folder: 'update resource role by m2m',
    iterationData: require('./testData/resource-role/update-resource-role-by-m2m.json')
  },
  {
    folder: 'update resource role with all kinds of invalid token',
    iterationData: require('./testData/resource-role/update-resource-role-with-invalid-tokens.json')
  }, {
    folder: 'failure - update resource role invalid id 404'
  },
  {
    folder: 'create dependency by admin',
    iterationData: require('./testData/resource-role-phase-dependency/create-dependency.json')
  },
  {
    folder: 'create dependency by m2m',
    iterationData: require('./testData/resource-role-phase-dependency/create-dependency.json')
  },
  {
    folder: 'create dependency with all kinds of invalid token',
    iterationData: require('./testData/resource-role-phase-dependency/create-dependency-with-invalid-tokens.json')
  },
  {
    folder: 'create dependency with not found phase id 404'
  },
  {
    folder: 'get all dependencies'
  },
  {
    folder: 'get matched dependencies'
  },
  {
    folder: 'get dependencies with all kinds of invalid token',
    iterationData: require('./testData/resource-role-phase-dependency/get-dependency-with-invalid-tokens.json')
  },
  {
    folder: 'update dependency by admin',
    iterationData: require('./testData/resource-role-phase-dependency/update-dependency.json')
  },
  {
    folder: 'update dependency by m2m',
    iterationData: require('./testData/resource-role-phase-dependency/update-dependency.json')
  },
  {
    folder: 'update not found dependency 404'
  },
  {
    folder: 'update dependency with all kinds of invalid token',
    iterationData: require('./testData/resource-role-phase-dependency/update-dependency-with-invalid-tokens.json')
  },
  {
    folder: 'delete dependency with all kinds of invalid token',
    iterationData: require('./testData/resource-role-phase-dependency/delete-dependency-with-invalid-tokens.json')
  },
  {
    folder: 'delete dependency with admin'
  },
  {
    folder: 'delete dependency with m2m'
  },
  {
    folder: 'create resource role with all kinds of invalid request body',
    iterationData: require('./testData/resource-role/create-resource-role-with-invalid-data.json')
  },
  {
    folder: 'update resource role with all kinds of invalid request body',
    iterationData: require('./testData/resource-role/update-resource-role-with-invalid-data.json')
  },
  {
    folder: 'get all resource roles'
  },
  {
    folder: 'get matched resource roles'
  },
  {
    folder: 'get resource roles with all kinds of invalid parameter',
    iterationData: require('./testData/resource-role/get-resource-role-with-invalid-data.json')
  },
  {
    folder: 'create dependency with all kinds of invalid request body',
    iterationData: require('./testData/resource-role-phase-dependency/create-dependency-with-invalid-data.json')
  },
  {
    folder: 'update dependency with all kinds of invalid request body',
    iterationData: require('./testData/resource-role-phase-dependency/update-dependency-with-invalid-data.json')
  },
  {
    folder: 'get dependencies with all kinds of invalid parameter',
    iterationData: require('./testData/resource-role-phase-dependency/get-dependencies-with-invalid-data.json')
  },
  {
    folder: 'create resource by admin',
    iterationData: require('./testData/resource/create-resource-by-admin.json')
  },
  {
    folder: 'create resource using m2m token',
    iterationData: require('./testData/resource/create-resource-by-m2m.json')
  },
  {
    folder: 'create resource with all kinds of invalid token',
    iterationData: require('./testData/resource/create-resource-with-invalid-tokens.json')
  },
  {
    folder: 'create resource with all kinds of invalid request body',
    iterationData: require('./testData/resource/create-resource-with-invalid-data.json')
  },
  {
    folder: 'get resources by required parameter only',
    iterationData: require('./testData/resource/get-resources-with-required-parameter.json')
  },
  {
    folder: 'get resources with all parameters',
    iterationData: require('./testData/resource/get-resources-with-all-parameters.json')
  },
  {
    folder: 'get resources with all kinds of invalid parameter',
    iterationData: require('./testData/resource/get-resources-with-invalid-data.json')
  },
  {
    folder: 'get challenges by member with different users',
    iterationData: require('./testData/resource/get-resources-by-member-with-different-users.json')
  },
  {
    folder: 'get challenges by member with resource role',
    iterationData: require('./testData/resource/get-resources-by-member-with-resource-role.json')
  },
  {
    folder: 'get challenges by member with all kinds of invalid token',
    iterationData: require('./testData/resource/get-resources-by-member-with-invalid-tokens.json')
  },
  {
    folder: 'get challenges by member with all kinds of invalid parameter',
    iterationData: require('./testData/resource/get-resources-by-member-with-invalid-parameter.json')
  },
  {
    folder: 'delete resource with all kinds of invalid token',
    iterationData: require('./testData/resource/delete-resource-with-invalid-tokens.json')
  },
  {
    folder: 'delete resource with all kinds of invalid parameter',
    iterationData: require('./testData/resource/delete-resource-with-invalid-parameter.json')
  },
  {
    folder: 'delete resource with admin'
  },
  {
    folder: 'delete resource with m2m'
  }
]

/**
 * Clear the test data.
 * @return {Promise<void>}
 */
async function clearTestData () {
  logger.info('Clear the Postman test data.')
  await helper.postRequest(`${config.API_BASE_URL}/${config.API_VERSION}/resources/internal/jobs/clean`)
  logger.info('Finished clear the Postman test data.')
}

/**
 * Run the postman tests.
 */
apiTestLib.runTests(requests, require.resolve('./resource-api.postman_collection.json'),
  require.resolve('./resource-api.postman_environment.json')).then(async () => {
  logger.info('newman test completed!')
  await clearTestData()
}).catch(async (err) => {
  logger.logFullError(err)

  // Only calling the clean up function when it is not validation error.
  if (err.name !== 'ValidationError') {
    await clearTestData()
  }
})
