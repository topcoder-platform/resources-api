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

## E2E testing with Postman

You should be able to find the tests result from the command window of running `npm run test:newman` for each test case.

### Postman mock server
E2E tests use nock to mock `BUSAPI_URL`, where postman mock server could be used to replace nock.
Please refer to: https://drive.google.com/file/d/1GXMzyqpzwix-LDBwieiRFfpJlJxrTIgI/view?usp=sharing

Below is a sample output result of finding resources by member.

```
resource-api

Iteration 1/4

❏ Resources / list challenge by member
↳ get challenges by member with resource role
  GET http://localhost:3000/v5/resources/16096823/challenges?resourceRoleId=c943cb74-37bb-409a-994e-1cd28fbbb7b5 [200 OK, 702B, 11ms]
  ✓  Status code is 200

Iteration 2/4

↳ get challenges by member with resource role
  GET http://localhost:3000/v5/resources/16096823/challenges?resourceRoleId=c943cb74-37bb-409a-994e-1cd28fbbb7b5 [200 OK, 702B, 17ms]
  ✓  Status code is 200

Iteration 3/4

↳ get challenges by member with resource role
  GET http://localhost:3000/v5/resources/16096823/challenges?resourceRoleId=c943cb74-37bb-409a-994e-1cd28fbbb7b5 [200 OK, 702B, 21ms]
  ✓  Status code is 200

Iteration 4/4

↳ get challenges by member with resource role
  GET http://localhost:3000/v5/resources/not_exist_user/challenges?resourceRoleId=c943cb74-37bb-409a-994e-1cd28fbbb7b5 [200 OK, 397B, 24ms]
  ✓  Status code is 200

┌─────────────────────────┬──────────────────┬──────────────────┐
│                         │         executed │           failed │
├─────────────────────────┼──────────────────┼──────────────────┤
│              iterations │                4 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│                requests │                4 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│            test-scripts │                4 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│      prerequest-scripts │                0 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│              assertions │                4 │                0 │
├─────────────────────────┴──────────────────┴──────────────────┤
│ total run duration: 207ms                                     │
├───────────────────────────────────────────────────────────────┤
│ total data received: 122B (approx)                            │
├───────────────────────────────────────────────────────────────┤
│ average response time: 18ms [min: 11ms, max: 24ms, s.d.: 4ms] │
└───────────────────────────────────────────────────────────────┘
```