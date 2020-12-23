# Topcoder Challenge Resources API

## Postman test
- import Postman collection and environment in the docs folder to Postman
- Refer `ReadMe.md` to start DynamoDB, create tables, start the app and mock server
- run `npm run init-db` to clear the database before testing.
- Just run the whole test cases under provided environment.
- For testing the negative scenario for health check endpoint, you can modify DYNAMODB.URL under `config/default.js` into an incorrect url or terminate the local DynamoDB. Then start the app again and run the health check test again.
- For each success POST/PUT/DELETE request, it will also send an event using bus api. You can also check the app console, it will have info log like `Publish event to Kafka topic <TOPIC_NAME>`. Go to https://lauscher.topcoder-dev.com/ view topics `challenge.action.resource.create`, `challenge.action.resource.delete`, `challenge.action.resource.role.create` and `challenge.action.resource.role.update`, to verify the Kafka message have successfully received.

## Unit test Coverage

  127 passing (1m)

File                                    |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s
----------------------------------------|----------|----------|----------|----------|-------------------
All files                               |    88.69 |     83.7 |    90.43 |    88.48 |
 resources-api                          |      100 |      100 |      100 |      100 |
  app-bootstrap.js                      |      100 |      100 |      100 |      100 |
  app-constants.js                      |      100 |      100 |      100 |      100 |
 resources-api/config                   |      100 |    98.78 |      100 |      100 |
  default.js                            |      100 |    98.78 |      100 |      100 |                35
  test.js                               |      100 |      100 |      100 |      100 |
 resources-api/src/common               |    74.45 |    52.17 |    83.02 |    75.11 |
  errors.js                             |      100 |       50 |      100 |      100 |                23
  helper.js                             |    65.13 |       50 |    76.32 |    65.75 |... 46,364,374,390
  logger.js                             |    92.31 |       60 |      100 |    92.31 |   31,53,58,82,116
 resources-api/src/models               |      100 |       50 |      100 |      100 |
  MemberProfile.js                      |      100 |      100 |      100 |      100 |
  MemberStats.js                        |      100 |      100 |      100 |      100 |
  Resource.js                           |      100 |      100 |      100 |      100 |
  ResourceRole.js                       |      100 |      100 |      100 |      100 |
  ResourceRolePhaseDependency.js        |      100 |      100 |      100 |      100 |
  index.js                              |      100 |       50 |      100 |      100 |              8,18
 resources-api/src/services             |    98.23 |    96.45 |      100 |    98.05 |
  ResourceRolePhaseDependencyService.js |    94.83 |     87.5 |      100 |    94.74 |        77,113,136
  ResourceRoleService.js                |    96.55 |       90 |      100 |    95.35 |             60,96
  ResourceService.js                    |      100 |      100 |      100 |      100 |

## E2E test Coverage

  170 passing (1m)

File                                       |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s
-------------------------------------------|----------|----------|----------|----------|-------------------
All files                                  |     95.8 |    89.63 |    99.17 |    95.57 |
 resources-api                             |    96.26 |    85.96 |      100 |    96.12 |
  app-bootstrap.js                         |      100 |      100 |      100 |      100 |
  app-constants.js                         |      100 |      100 |      100 |      100 |
  app-routes.js                            |    97.62 |    96.15 |      100 |    97.62 |                25
  app.js                                   |    94.23 |    77.42 |      100 |    94.23 |          45,75,91
 resources-api/config                      |      100 |    98.78 |      100 |      100 |
  default.js                               |      100 |    98.78 |      100 |      100 |                35
  test.js                                  |      100 |      100 |      100 |      100 |
 resources-api/src                         |      100 |      100 |      100 |      100 |
  routes.js                                |      100 |      100 |      100 |      100 |
 resources-api/src/common                  |    91.19 |       75 |    98.11 |    90.95 |
  errors.js                                |      100 |       50 |      100 |      100 |                23
  helper.js                                |    90.13 |    78.57 |    97.37 |    89.73 |... 69,364,374,390
  logger.js                                |    92.31 |       65 |      100 |    92.31 |   31,53,58,82,116
 resources-api/src/controllers             |      100 |      100 |      100 |      100 |
  HealthCheckController.js                 |      100 |      100 |      100 |      100 |
  ResourceController.js                    |      100 |      100 |      100 |      100 |
  ResourceRoleController.js                |      100 |      100 |      100 |      100 |
  ResourceRolePhaseDependencyController.js |      100 |      100 |      100 |      100 |
 resources-api/src/models                  |      100 |       50 |      100 |      100 |
  MemberProfile.js                         |      100 |      100 |      100 |      100 |
  MemberStats.js                           |      100 |      100 |      100 |      100 |
  Resource.js                              |      100 |      100 |      100 |      100 |
  ResourceRole.js                          |      100 |      100 |      100 |      100 |
  ResourceRolePhaseDependency.js           |      100 |      100 |      100 |      100 |
  index.js                                 |      100 |       50 |      100 |      100 |              8,18
 resources-api/src/services                |    98.24 |    96.45 |      100 |    98.06 |
  HealthCheckService.js                    |      100 |      100 |      100 |      100 |
  ResourceRolePhaseDependencyService.js    |    94.83 |     87.5 |      100 |    94.74 |        77,113,136
  ResourceRoleService.js                   |    96.55 |       90 |      100 |    95.35 |             60,96
  ResourceService.js                       |      100 |      100 |      100 |      100 |
