# Topcoder Challenge Resources API

## Postman test
- import Postman collection and environment in the docs folder to Postman
- Refer `ReadMe.md` to start DynamoDB, create tables, start the app and mock server
- run `npm run init-db` to clear the database before testing.
- Just run the whole test cases under provided environment.
- For testing the negative scenario for health check endpoint, you can modify DYNAMODB.URL under `config/default.js` into an incorrect url or terminate the local DynamoDB. Then start the app again and run the health check test again.
- For each success POST/PUT/DELETE request, it will also send an event using bus api. You can also check the app console, it will have info log like `Publish event to Kafka topic <TOPIC_NAME>`. Go to https://lauscher.topcoder-dev.com/ view topics `challenge.action.resource.create`, `challenge.action.resource.delete`, `challenge.action.resource.role.create` and `challenge.action.resource.role.update`, to verify the Kafka message have successfully received.

## Unit test Coverage

  115 passing (2m)

----------------------------------------|----------|----------|----------|----------|-------------------|
File                                    |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------------------------------------|----------|----------|----------|----------|-------------------|
All files                               |    88.21 |     75.6 |    90.14 |    88.66 |                   |
 resources-api                          |      100 |      100 |      100 |      100 |                   |
  app-bootstrap.js                      |      100 |      100 |      100 |      100 |                   |
  app-constants.js                      |      100 |      100 |      100 |      100 |                   |
 resources-api/config                   |      100 |    92.65 |      100 |      100 |                   |
  default.js                            |      100 |    92.65 |      100 |      100 |    13,14,16,17,29 |
  test.js                               |      100 |      100 |      100 |      100 |                   |
 resources-api/src/common               |    77.78 |    54.41 |    84.09 |    79.04 |                   |
  errors.js                             |      100 |       50 |      100 |      100 |                23 |
  helper.js                             |    65.63 |    52.17 |    75.86 |    67.39 |... 91,209,262,272 |
  logger.js                             |    92.31 |       60 |      100 |    92.31 |   31,53,58,82,116 |
 resources-api/src/models               |      100 |       50 |      100 |      100 |                   |
  Resource.js                           |      100 |      100 |      100 |      100 |                   |
  ResourceRole.js                       |      100 |      100 |      100 |      100 |                   |
  ResourceRolePhaseDependency.js        |      100 |      100 |      100 |      100 |                   |
  index.js                              |      100 |       50 |      100 |      100 |                14 |
 resources-api/src/services             |     95.1 |    78.57 |      100 |       95 |                   |
  ResourceRolePhaseDependencyService.js |     93.1 |    79.17 |      100 |    92.98 |     55,77,113,136 |
  ResourceRoleService.js                |    94.87 |       75 |      100 |    94.59 |             47,82 |
  ResourceService.js                    |    96.26 |    78.75 |      100 |    96.23 |    77,154,158,162 |
----------------------------------------|----------|----------|----------|----------|-------------------|


## E2E test Coverage

  164 passing (6m)

-------------------------------------------|----------|----------|----------|----------|-------------------|
File                                       |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-------------------------------------------|----------|----------|----------|----------|-------------------|
All files                                  |    93.92 |    80.27 |       99 |    93.81 |                   |
 resources-api                             |    95.88 |    82.98 |      100 |    95.79 |                   |
  app-bootstrap.js                         |      100 |      100 |      100 |      100 |                   |
  app-constants.js                         |      100 |      100 |      100 |      100 |                   |
  app-routes.js                            |     97.3 |    93.75 |      100 |     97.3 |                24 |
  app.js                                   |    94.23 |    77.42 |      100 |    94.23 |          42,72,88 |
 resources-api/config                      |      100 |    92.65 |      100 |      100 |                   |
  default.js                               |      100 |    92.65 |      100 |      100 |    13,14,16,17,29 |
  test.js                                  |      100 |      100 |      100 |      100 |                   |
 resources-api/src                         |      100 |      100 |      100 |      100 |                   |
  routes.js                                |      100 |      100 |      100 |      100 |                   |
 resources-api/src/common                  |    89.47 |    70.59 |    97.73 |    89.22 |                   |
  errors.js                                |      100 |       50 |      100 |      100 |                23 |
  helper.js                                |    86.46 |    73.91 |    96.55 |    85.87 |... 91,209,262,272 |
  logger.js                                |    92.31 |       65 |      100 |    92.31 |   31,53,58,82,116 |
 resources-api/src/controllers             |      100 |      100 |      100 |      100 |                   |
  HealthCheckController.js                 |      100 |      100 |      100 |      100 |                   |
  ResourceController.js                    |      100 |      100 |      100 |      100 |                   |
  ResourceRoleController.js                |      100 |      100 |      100 |      100 |                   |
  ResourceRolePhaseDependencyController.js |      100 |      100 |      100 |      100 |                   |
 resources-api/src/models                  |      100 |       50 |      100 |      100 |                   |
  Resource.js                              |      100 |      100 |      100 |      100 |                   |
  ResourceRole.js                          |      100 |      100 |      100 |      100 |                   |
  ResourceRolePhaseDependency.js           |      100 |      100 |      100 |      100 |                   |
  index.js                                 |      100 |       50 |      100 |      100 |                14 |
 resources-api/src/services                |    94.93 |    78.07 |      100 |    94.84 |                   |
  HealthCheckService.js                    |    92.31 |       50 |      100 |    92.31 |                15 |
  ResourceRolePhaseDependencyService.js    |     93.1 |    79.17 |      100 |    92.98 |     55,77,113,136 |
  ResourceRoleService.js                   |    94.87 |       75 |      100 |    94.59 |             47,82 |
  ResourceService.js                       |    96.26 |    78.75 |      100 |    96.23 |    77,154,158,162 |
-------------------------------------------|----------|----------|----------|----------|-------------------|
