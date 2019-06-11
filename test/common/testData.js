/*
 * Test data to be used in tests
 */

const token = {
  admin: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJUb3Bjb2RlciBVc2VyIiwiQ29ubmVjdCBTdXBwb3J0IiwiYWRtaW5pc3RyYXRvciIsInRlc3RSb2xlIiwiYWFhIiwidG9ueV90ZXN0XzEiLCJDb25uZWN0IE1hbmFnZXIiLCJDb25uZWN0IEFkbWluIiwiY29waWxvdCIsIkNvbm5lY3QgQ29waWxvdCBNYW5hZ2VyIl0sImlzcyI6Imh0dHBzOi8vYXBpLnRvcGNvZGVyLWRldi5jb20iLCJoYW5kbGUiOiJUb255SiIsImV4cCI6MTU2MTA1MjIxMSwidXNlcklkIjoiODU0Nzg5OSIsImlhdCI6MTU0OTc5MTYxMSwiZW1haWwiOiJ0amVmdHMrZml4QHRvcGNvZGVyLmNvbSIsImp0aSI6ImY5NGQxZTI2LTNkMGUtNDZjYS04MTE1LTg3NTQ1NDRhMDhmMSJ9.Wz3GrpSx_imujnbUUQpvQgYzmYgvU6901itoYbE9-cc',
  denis: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJUb3Bjb2RlciBVc2VyIl0sImlzcyI6Imh0dHBzOi8vYXBpLnRvcGNvZGVyLWRldi5jb20iLCJoYW5kbGUiOiJkZW5pcyIsImV4cCI6MTU2MjgwMDE2OSwidXNlcklkIjoiMjUxMjgwIiwiaWF0IjoxNTQ5Nzk5NTY5LCJlbWFpbCI6ImVtYWlsQGRvbWFpbi5jb20ueiIsImp0aSI6IjljNDUxMWM1LWMxNjUtNGExYi04OTllLWI2NWFkMGUwMmI1NSJ9.a5-oBMwFtwGkSw2161y0lEu1XvKsKElCmRu6e8Q6PPk',
  hohosky: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJUb3Bjb2RlciBVc2VyIiwiY29waWxvdCJdLCJpc3MiOiJodHRwczovL2FwaS50b3Bjb2Rlci1kZXYuY29tIiwiaGFuZGxlIjoiaG9ob3NreSIsImV4cCI6MTU2MTc5MjM3MCwidXNlcklkIjoiMTYwOTY4MjMiLCJpYXQiOjE1NDk3OTE3NzAsImVtYWlsIjoiZW1haWxAZG9tYWluLmNvbS56IiwianRpIjoiZjFlNjEzYmUtZDViOS00MjMxLWJhYWUtZWU5ZjJkMjI3MjM0In0.E4UWONXdmUy7o7EMbzF6nNLXDpS3CVWbFudlcZ3PDoE',
  m2m: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3RvcGNvZGVyLWRldi5hdXRoMC5jb20vIiwic3ViIjoiZW5qdzE4MTBlRHozWFR3U08yUm4yWTljUVRyc3BuM0JAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbTJtLnRvcGNvZGVyLWRldi5jb20vIiwiaWF0IjoxNTUwOTA2Mzg4LCJleHAiOjE1NjA5OTI3ODgsImF6cCI6ImVuancxODEwZUR6M1hUd1NPMlJuMlk5Y1FUcnNwbjNCIiwic2NvcGUiOiJhbGw6cmVzb3VyY2VzIGFsbDpyZXNvdXJjZV9yb2xlcyIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyJ9.WysX2Ncm2WVgF1Dgm9qvvODjNtWq8GbJOqST4ch4xA0',
  m2mRead: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3RvcGNvZGVyLWRldi5hdXRoMC5jb20vIiwic3ViIjoiZW5qdzE4MTBlRHozWFR3U08yUm4yWTljUVRyc3BuM0JAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbTJtLnRvcGNvZGVyLWRldi5jb20vIiwiaWF0IjoxNTUwOTA2Mzg4LCJleHAiOjE1NjA5OTI3ODgsImF6cCI6ImVuancxODEwZUR6M1hUd1NPMlJuMlk5Y1FUcnNwbjNCIiwic2NvcGUiOiJyZWFkOnJlc291cmNlcyIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyJ9.O_y5YfNmKkNXdG5FaJe9enouPmEJCpk3bnTSs3dRmQk',
  m2mModify: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3RvcGNvZGVyLWRldi5hdXRoMC5jb20vIiwic3ViIjoiZW5qdzE4MTBlRHozWFR3U08yUm4yWTljUVRyc3BuM0JAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8vbTJtLnRvcGNvZGVyLWRldi5jb20vIiwiaWF0IjoxNTUwOTA2Mzg4LCJleHAiOjE1NjA5OTI3ODgsImF6cCI6ImVuancxODEwZUR6M1hUd1NPMlJuMlk5Y1FUcnNwbjNCIiwic2NvcGUiOiJjcmVhdGU6cmVzb3VyY2VzIGRlbGV0ZTpyZXNvdXJjZXMgdXBkYXRlOnJlc291cmNlcyIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyJ9.nbbDW1Zbg4FguF63RaGRYY-wHHfKYjbveiStceZ-qI4',
  expired: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJUb3Bjb2RlciBVc2VyIiwiQ29ubmVjdCBTdXBwb3J0IiwiYWRtaW5pc3RyYXRvciIsInRlc3RSb2xlIiwiYWFhIiwidG9ueV90ZXN0XzEiLCJDb25uZWN0IE1hbmFnZXIiLCJDb25uZWN0IEFkbWluIiwiY29waWxvdCIsIkNvbm5lY3QgQ29waWxvdCBNYW5hZ2VyIl0sImlzcyI6Imh0dHBzOi8vYXBpLnRvcGNvZGVyLWRldi5jb20iLCJoYW5kbGUiOiJUb255SiIsImV4cCI6MTU1MTA2MzIxMSwidXNlcklkIjoiODU0Nzg5OSIsImlhdCI6MTU1MTA1MzIxMSwiZW1haWwiOiJ0amVmdHMrZml4QHRvcGNvZGVyLmNvbSIsImp0aSI6ImY5NGQxZTI2LTNkMGUtNDZjYS04MTE1LTg3NTQ1NDRhMDhmMSJ9.97-pjuSGGqDAqK2FG2yi_3nmzB7ZMXQwtG0bi8_PlKk'
}

const user = {
  admin: {
    roles: [
      'Topcoder User',
      'Connect Support',
      'administrator',
      'testRole',
      'aaa',
      'tony_test_1',
      'Connect Manager',
      'Connect Admin',
      'copilot',
      'Connect Copilot Manager'
    ],
    iss: 'https://api.topcoder-dev.com',
    handle: 'TonyJ',
    exp: 1561052211,
    userId: '8547899',
    iat: 1549791611,
    email: 'tjefts+fix@topcoder.com',
    jti: 'f94d1e26-3d0e-46ca-8115-8754544a08f1'
  },
  denis: {
    roles: [ 'Topcoder User' ],
    iss: 'https://api.topcoder-dev.com',
    handle: 'denis',
    exp: 1562800169,
    userId: '251280',
    iat: 1549799569,
    email: 'email@domain.com.z',
    jti: '9c4511c5-c165-4a1b-899e-b65ad0e02b55'
  },
  hohosky: {
    roles: [ 'Topcoder User', 'copilot' ],
    iss: 'https://api.topcoder-dev.com',
    handle: 'hohosky',
    exp: 1561792370,
    userId: '16096823',
    iat: 1549791770,
    email: 'email@domain.com.z',
    jti: 'f1e613be-d5b9-4231-baae-ee9f2d227234'
  },
  m2m: {
    iss: 'https://topcoder-dev.auth0.com/',
    sub: 'enjw1810eDz3XTwSO2Rn2Y9cQTrspn3B@clients',
    aud: 'https://m2m.topcoder-dev.com/',
    iat: 1550906388,
    exp: 1560992788,
    azp: 'enjw1810eDz3XTwSO2Rn2Y9cQTrspn3B',
    scope: 'all:resources all:resource_roles',
    gty: 'client-credentials',
    userId: null,
    scopes: [ 'all:resources', 'all:resource_roles' ],
    isMachine: true
  },
  m2mResources: {
    iss: 'https://topcoder-dev.auth0.com/',
    sub: 'enjw1810eDz3XTwSO2Rn2Y9cQTrspn3B@clients',
    aud: 'https://m2m.topcoder-dev.com/',
    iat: 1550906388,
    exp: 1560992788,
    azp: 'enjw1810eDz3XTwSO2Rn2Y9cQTrspn3B',
    scope: 'create:resources read:resources delete:resources',
    gty: 'client-credentials',
    userId: null,
    scopes: [ 'create:resources', 'read:resources', 'delete:resources' ],
    isMachine: true
  }
}

const requestBody = {
  resourceRoles: {
    stringFields: ['name'],
    booleanFields: ['fullAccess', 'isActive'],
    requiredFields: ['name', 'fullAccess', 'isActive'],
    testBody: {
      name: 'name',
      fullAccess: true,
      isActive: true
    },
    createBody: (name, fullAccess, isActive) => {
      return { name, fullAccess, isActive }
    }
  },
  resources: {
    stringFields: ['challengeId', 'memberHandle', 'roleId'],
    requiredFields: ['challengeId', 'memberHandle', 'roleId'],
    testBody: {
      challengeId: 'fe6d0a58-ce7d-4521-8501-b8132b1c0391',
      memberHandle: 'handle',
      roleId: 'fe6d0a58-ce7d-4521-8501-b8132b1c0391'
    },
    createBody: (memberHandle, roleId, challengeId) => {
      return { memberHandle, roleId, challengeId }
    }
  }
}

module.exports = {
  token,
  user,
  requestBody
}
