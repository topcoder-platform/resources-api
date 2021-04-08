const newman = require('newman')
const _ = require('lodash')
const envHelper = require('./envHelper')

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

const options = {
  collection: require('./resource-api.postman_collection.json'),
  exportEnvironment: 'test/postman/resource-api.postman_environment.json',
  reporters: 'cli'
}
const runner = (options) => new Promise((resolve, reject) => {
  newman.run(options, function (err, results) {
    if (err) {
      reject(err)
      return
    }
    resolve(results)
  })
})

;(async () => {
  const m2mToken = await envHelper.getM2MToken()
  const adminToken = await envHelper.getAdminToken()
  const copilotToken = await envHelper.getCopilotToken()
  const userToken = await envHelper.getUserToken()
  const originalEnvVars = [
    { key: 'M2M_TOKEN', value: `Bearer ${m2mToken}` },
    { key: 'admin_token', value: `Bearer ${adminToken}` },
    { key: 'copilot_token', value: `Bearer ${copilotToken}` },
    { key: 'user_token', value: `Bearer ${userToken}` }
  ]
  for (const request of requests) {
    options.envVar = [
      ...originalEnvVars,
      ..._.map(_.keys(request.iterationData || {}), key => ({ key, value: request.iterationData[key] }))
    ]
    delete require.cache[require.resolve('./resource-api.postman_environment.json')]
    options.environment = require('./resource-api.postman_environment.json')
    options.folder = request.folder
    options.iterationData = request.iterationData
    try {
      const results = await runner(options)
      if (_.get(results, 'run.failures.length', 0) > 0) {
        process.exit(-1)
      }
    } catch (err) {
      console.log(err)
    }
  }
})().then(() => {
  console.log('newman test completed!')
  process.exit(0)
}).catch((err) => {
  console.log(err)
  process.exit(1)
})
