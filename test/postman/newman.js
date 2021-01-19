const newman = require('newman')

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
  }
]

const options = {
  collection: require('./resource-api.postman_collection.json'),
  exportEnvironment: 'test/postman/resource-api.postman_environment.json',
  reporters: 'cli'
}

const runner = (options) => new Promise((resolve, reject) => {
  newman.run(options, function (err) {
    if (err) {
      reject(err)
      return
    }
    resolve()
  })
})

;(async () => {
  for (const request of requests) {
    delete require.cache[require.resolve('./resource-api.postman_environment.json')]
    options.environment = require('./resource-api.postman_environment.json')
    options.folder = request.folder
    options.iterationData = request.iterationData
    try {
      await runner(options)
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
