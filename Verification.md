# Topcoder Challenge Resources API Verification

## Postman test
- import Postman collection and environment in the docs folder to Postman
- Refer `ReadMe.md` to setup the app
- Just run the whole test cases under provided environment.
- For testing the negative scenario for health check endpoint, you can modify DYNAMODB.URL under `config/default.js` into an incorrect url or terminate the local DynamoDB. Then start the app again and run the health check test again.
- For each success POST/PUT/DELETE request, it will also send an event using bus api. You can also check the app console, it will have info log like `Publish event to Kafka topic <TOPIC_NAME>`. Go to https://lauscher.topcoder-dev.com/ view topics `challenge.action.resource.create`, `challenge.action.resource.delete`, `challenge.action.resource.role.create` and `challenge.action.resource.role.update`, to verify the Kafka message have successfully received.

## Unit test Coverage

  84 passing (1m)

----------------------------|----------|----------|----------|----------|-------------------|
File                        |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------------------------|----------|----------|----------|----------|-------------------|
All files                   |    87.47 |    80.83 |    86.57 |    88.55 |                   |
 resources-api              |      100 |      100 |      100 |      100 |                   |
  app-bootstrap.js          |      100 |      100 |      100 |      100 |                   |
  app-constants.js          |      100 |      100 |      100 |      100 |                   |
 resources-api/config       |      100 |    93.75 |      100 |      100 |                   |
  default.js                |      100 |    93.75 |      100 |      100 |    13,14,16,17,28 |
  test.js                   |      100 |      100 |      100 |      100 |                   |
 resources-api/src/common   |    79.23 |    54.55 |    82.98 |     80.9 |                   |
  errors.js                 |      100 |       50 |      100 |      100 |                23 |
  helper.js                 |    69.44 |    52.27 |       75 |    71.84 |... 78,196,214,263 |
  logger.js                 |    92.31 |       60 |      100 |    92.31 |   31,53,58,82,116 |
 resources-api/src/models   |      100 |       50 |      100 |      100 |                   |
  Resource.js               |      100 |      100 |      100 |      100 |                   |
  ResourceRole.js           |      100 |      100 |      100 |      100 |                   |
  index.js                  |      100 |       50 |      100 |      100 |                14 |
 resources-api/src/services |    94.94 |    89.13 |    94.74 |    95.48 |                   |
  ResourceRoleService.js    |    93.02 |       75 |      100 |    92.68 |          25,58,93 |
  ResourceService.js        |    95.65 |    91.25 |    92.86 |    96.49 |     63,99,136,322 |
----------------------------|----------|----------|----------|----------|-------------------|


## E2E test Coverage

  119 passing (1m)

-------------------------------|----------|----------|----------|----------|-------------------|
File                           |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
-------------------------------|----------|----------|----------|----------|-------------------|
All files                      |    93.31 |    84.43 |    96.74 |     93.6 |                   |
 resources-api                 |    94.57 |    80.85 |      100 |    94.51 |                   |
  app-bootstrap.js             |      100 |      100 |      100 |      100 |                   |
  app-constants.js             |      100 |      100 |      100 |      100 |                   |
  app-routes.js                |    94.59 |     87.5 |      100 |    94.59 |             24,68 |
  app.js                       |    93.75 |    77.42 |      100 |    93.75 |          36,66,82 |
 resources-api/config          |      100 |    93.75 |      100 |      100 |                   |
  default.js                   |      100 |    93.75 |      100 |      100 |    13,14,16,17,28 |
  test.js                      |      100 |      100 |      100 |      100 |                   |
 resources-api/src             |      100 |      100 |      100 |      100 |                   |
  routes.js                    |      100 |      100 |      100 |      100 |                   |
 resources-api/src/common      |    90.16 |    71.21 |    95.74 |    90.45 |                   |
  errors.js                    |      100 |       50 |      100 |      100 |                23 |
  helper.js                    |    87.96 |       75 |    93.75 |    88.35 |... 78,196,214,263 |
  logger.js                    |    92.31 |       65 |      100 |    92.31 |   31,53,58,82,116 |
 resources-api/src/controllers |      100 |      100 |      100 |      100 |                   |
  HealthCheckController.js     |      100 |      100 |      100 |      100 |                   |
  ResourceController.js        |      100 |      100 |      100 |      100 |                   |
  ResourceRoleController.js    |      100 |      100 |      100 |      100 |                   |
 resources-api/src/models      |      100 |       50 |      100 |      100 |                   |
  Resource.js                  |      100 |      100 |      100 |      100 |                   |
  ResourceRole.js              |      100 |      100 |      100 |      100 |                   |
  index.js                     |      100 |       50 |      100 |      100 |                14 |
 resources-api/src/services    |    94.29 |     88.3 |    95.65 |    94.77 |                   |
  HealthCheckService.js        |    88.24 |       50 |      100 |    88.24 |             16,32 |
  ResourceRoleService.js       |    93.02 |       75 |      100 |    92.68 |          25,58,93 |
  ResourceService.js           |    95.65 |    91.25 |    92.86 |    96.49 |     63,99,136,322 |
-------------------------------|----------|----------|----------|----------|-------------------|
