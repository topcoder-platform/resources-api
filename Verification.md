# Topcoder Challenge Resources API

## Postman test
- import Postman collection and environment in the docs folder to Postman
- Refer `ReadMe.md` to start DynamoDB, start the app and mock server
- run `npm run init-db` to clear the database before testing.
- Just run the whole test cases under provided environment.
- For testing the negative scenario for health check endpoint, you can modify DYNAMODB.URL under `config/default.js` into an incorrect url or terminate the local DynamoDB. Then start the app again and run the health check test again.
- For each success POST/PUT/DELETE request, it will also send an event using bus api. You can also check the app console, it will have info log like `Publish event to Kafka topic <TOPIC_NAME>`. Go to https://lauscher.topcoder-dev.com/ view topics `challenge.action.resource.create`, `challenge.action.resource.delete`, `challenge.action.resource.role.create` and `challenge.action.resource.role.update`, to verify the Kafka message have successfully received.

## Unit test Coverage

  84 passing (1m)

File                        |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s
----------------------------|----------|----------|----------|----------|-------------------
All files                   |    87.46 |    81.05 |    88.52 |    88.16 |
 resources-api              |      100 |      100 |      100 |      100 |
  app-bootstrap.js          |      100 |      100 |      100 |      100 |
  app-constants.js          |      100 |      100 |      100 |      100 |
 resources-api/config       |      100 |    98.44 |      100 |      100 |
  default.js                |      100 |    98.44 |      100 |      100 |                27
  test.js                   |      100 |      100 |      100 |      100 |
 resources-api/src/common   |    77.07 |       50 |    83.72 |    78.43 |
  errors.js                 |      100 |       50 |      100 |      100 |                23
  helper.js                 |     62.2 |    44.12 |       75 |     64.1 |... 52,173,191,209
  logger.js                 |    92.31 |       60 |      100 |    92.31 |   31,53,58,82,116
 resources-api/src/models   |      100 |       50 |      100 |      100 |
  Resource.js               |      100 |      100 |      100 |      100 |
  ResourceRole.js           |      100 |      100 |      100 |      100 |
  index.js                  |      100 |       50 |      100 |      100 |                14
 resources-api/src/services |    97.67 |    91.18 |      100 |    97.64 |
  ResourceRoleService.js    |    94.87 |       75 |      100 |    94.59 |             47,82
  ResourceService.js        |    98.89 |    93.33 |      100 |    98.89 |                76

## E2E test Coverage

  119 passing (1m)

File                           |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s
-------------------------------|----------|----------|----------|----------|-------------------
All files                      |    94.46 |    85.77 |    98.84 |    94.37 |
 resources-api                 |     95.6 |    82.98 |      100 |    95.56 |
  app-bootstrap.js             |      100 |      100 |      100 |      100 |
  app-constants.js             |      100 |      100 |      100 |      100 |
  app-routes.js                |     97.3 |    93.75 |      100 |     97.3 |                24
  app.js                       |    93.75 |    77.42 |      100 |    93.75 |          36,66,82
 resources-api/config          |      100 |    98.44 |      100 |      100 |
  default.js                   |      100 |    98.44 |      100 |      100 |                27
  test.js                      |      100 |      100 |      100 |      100 |
 resources-api/src             |      100 |      100 |      100 |      100 |
  routes.js                    |      100 |      100 |      100 |      100 |
 resources-api/src/common      |    89.81 |    69.64 |    97.67 |    89.54 |
  errors.js                    |      100 |       50 |      100 |      100 |                23
  helper.js                    |    86.59 |    73.53 |    96.43 |     85.9 |... 52,173,191,209
  logger.js                    |    92.31 |       65 |      100 |    92.31 |   31,53,58,82,116
 resources-api/src/controllers |      100 |      100 |      100 |      100 |
  HealthCheckController.js     |      100 |      100 |      100 |      100 |
  ResourceController.js        |      100 |      100 |      100 |      100 |
  ResourceRoleController.js    |      100 |      100 |      100 |      100 |
 resources-api/src/models      |      100 |       50 |      100 |      100 |
  Resource.js                  |      100 |      100 |      100 |      100 |
  ResourceRole.js              |      100 |      100 |      100 |      100 |
  index.js                     |      100 |       50 |      100 |      100 |                14
 resources-api/src/services    |    97.18 |       90 |      100 |    97.14 |
  HealthCheckService.js        |    92.31 |       50 |      100 |    92.31 |                15
  ResourceRoleService.js       |    94.87 |       75 |      100 |    94.59 |             47,82
  ResourceService.js           |    98.89 |    93.33 |      100 |    98.89 |                76
