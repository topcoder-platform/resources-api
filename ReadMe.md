# Topcoder Challenge Resources API

This microservice provides interaction with Challenge Resources.

### Development deployment status
[![CircleCI](https://circleci.com/gh/topcoder-platform/resources-api/tree/develop.svg?style=svg)](https://circleci.com/gh/topcoder-platform/resources-api/tree/develop)

### Production deployment status
[![CircleCI](https://circleci.com/gh/topcoder-platform/resources-api/tree/master.svg?style=svg)](https://circleci.com/gh/topcoder-platform/resources-api/tree/master)

## Swagger definition
-  [Swagger](https://github.com/topcoder-platform/resources-api/blob/develop/docs/swagger.yaml)

## Intended use

- Production API

## Related repos
-  [Challenge API](https://github.com/topcoder-platform/challenge-api)
-  [Frontend App](https://github.com/topcoder-platform/challenge-engine-ui)

## Prerequisites
-  [NodeJS](https://nodejs.org/en/) (v10)
-  [Docker](https://www.docker.com/)
-  [Docker Compose](https://docs.docker.com/compose/)

## Configuration

Configuration for the application is at `config/default.js`.
The following parameters can be set in config files or in env variables:

- LOG_LEVEL: the log level, default is 'debug'
- PORT: the server port, default is 3000
- API_VERSION: the API version, default is v5
- AUTH_SECRET: The authorization secret used during token verification.
- VALID_ISSUERS: The valid issuer of tokens, a json array contains valid issuer.
- AUTH0_URL: Auth0 URL, used to get TC M2M token
- AUTH0_AUDIENCE: Auth0 audience, used to get TC M2M token
- TOKEN_CACHE_TIME: Auth0 token cache time, used to get TC M2M token
- AUTH0_CLIENT_ID: Auth0 client id, used to get TC M2M token
- AUTH0_CLIENT_SECRET: Auth0 client secret, used to get TC M2M token
- AUTH0_PROXY_SERVER_URL: Proxy Auth0 URL, used to get TC M2M token
- TERMS_API_URL: Terms API url, default is 'https://api.topcoder-dev.com/v5/terms'
- MEMBER_API_URL: Member api url, default is 'https://api.topcoder-dev.com/v3/members'
- USER_API_URL: User api url, default is 'https://api.topcoder-dev.com/v3/users'
- CHALLENGE_API_URL: Challenge api url, default is 'http://localhost:4000/v5/challenges'.
- CHALLENGE_PHASES_API_URL: Challenge phases API URL, default is 'https://api.topcoder-dev.com/v5/challengephases'.
- SUBMISSIONS_API_URL: Submission API URL, default value is 'https://api.topcoder-dev.com/v5/submissions'
- SCOPES: The M2M scopes, refer `config/default.js` for more information
- BUSAPI_URL: the bus api, default value is 'https://api.topcoder-dev.com/v5'
- KAFKA_ERROR_TOPIC: Kafka error topic, default value is 'common.error.reporting',
- KAFKA_MESSAGE_ORIGINATOR: the Kafka message originator, default value is 'resources-api'
- RESOURCE_CREATE_TOPIC: the resource create Kafka topic, default value is 'challenge.action.resource.create',
- RESOURCE_DELETE_TOPIC: the resource delete Kafka topic, default value is 'challenge.action.resource.delete',
- RESOURCE_ROLE_CREATE_TOPIC: the resource role create topic, default value is 'challenge.action.resource.role.create',
- RESOURCE_ROLE_UPDATE_TOPIC: the resource role update topic, default value is 'challenge.action.resource.role.update'
- AUTOMATED_TESTING_NAME_PREFIX: the role name prefix for every `ResourceRole` record

Configuration for testing is at `config/test.js`, only add such new configurations different from `config/default.js`
- WAIT_TIME: wait time used in test, default is 6000 or 6 seconds
- MOCK_CHALLENGE_API_PORT: the mock server port, default is 4000.
- AUTH_V2_URL: The auth v2 url
- AUTH_V2_CLIENT_ID: The auth v2 client id
- AUTH_V3_URL: The auth v3 url
- ADMIN_CREDENTIALS_USERNAME: The user's username with admin role
- ADMIN_CREDENTIALS_PASSWORD: The user's password with admin role
- COPILOT_CREDENTIALS_USERNAME: The user's username with copilot role
- COPILOT_CREDENTIALS_PASSWORD: The user's password with copilot role
- USER_CREDENTIALS_USERNAME: The user's username with user role
- USER_CREDENTIALS_PASSWORD: The user's password with user role
- AUTOMATED_TESTING_REPORTERS_FORMAT: indicates reporters format. It is an array of the formats. e.g. `['html']` produces html format. `['cli', 'json', 'junit', 'html']` is the full format.   
*For the details of the supported format, please refer to https://www.npmjs.com/package/newman#reporters*.

## Available commands
- Be sure to set correct value for environment variable `DATABASE_URL` first.
- Install dependencies `npm install`
- Run lint `npm run lint`
- Run lint fix `npm run lint:fix`
- Create tables `npm run create-tables`
- Reset tables `npm run drop-tables`
- Clear all data in db `npm run clear-tables`
- Create tables for test environment `npm run create-tables:test`
- Reset tables for test environment `npm run drop-tables:test`
- Clear and init db `npm run init-db`
- Start app `npm start`
- App is running at `http://localhost:3000`
- Start mock challenge api server for unit tests `npm run mock-challenge-api`
- Start mock api server for local dev `npm run mock-api`
- The mock challenge api server is running at `http://localhost:4000`
- The mock api server is running at `http://localhost:4001`
- Run the Postman tests `npm run test:newman`
- Clear the testing data by Postman tests: `npm run test:newman:clear`

## Local Deployment
### Foreman Setup
To install foreman follow this [link](https://theforeman.org/manuals/1.24/#3.InstallingForeman)

To know how to use foreman follow this [link](https://theforeman.org/manuals/1.24/#2.Quickstart)


### Database Setup

We can use Postgres setup on Docker for testing purpose. Just run `docker-compose up` in `local` folder.

You can also use docker to start it directly.
```bash
docker pull postgres:16.8

docker run -d --name resourcedb -p 5432:5432 \
  -e POSTGRES_USER=johndoe -e POSTGRES_DB=resourcedb \
  -e POSTGRES_PASSWORD=mypassword \
  postgres:16.8
```

After that, please run
```bash
export DATABASE_URL="postgresql://johndoe:mypassword@localhost:5432/resourcedb?schema=public&statement_timeout=60000"
```

### Create Tables

1. Make sure Postgres are running as per instructions above.
2. Make sure you have configured all config parameters. Refer [Configuration](#configuration)
3. Run `npm run create-tables` to create tables and `npm run seed-tables` to create test data.

### Mock API

This mock service is designed for local development.

You can run mock api with `npm run mock-api`

It will setup local environment for Challenge API, Submission API and Member API.

### Mock Challenge V5 API

This mock service is designed for unit tests.

The `GET /v5/challenges/{id}` is mocked. It is a simple server app, the code is under mock folder.
You can start the mock server using command `npm run mock-challenge-api`.

### Scripts
1. Creating tables: `npm run create-tables`
2. Drop/delete tables: `npm run drop-tables`
3. Seed/Insert data to tables: `npm run seed-tables`
4. Initialize database in default environment, it will clear all data: `npm run init-db`
5. View table data in default environment: `npm run view-data <ModelName>`, ModelName can be `Resource`, `ResourceRole` or `ResourceRolePhaseDependency`


## Production deployment

- TBD

## Running tests

### Configuration
Test configuration is at `config/test.js`. You don't need to change them.

The following test parameters can be set in config file or in env variables:

- WAIT_TIME: wait time
- MOCK_CHALLENGE_API_PORT: mock challenge api port
- AUTH_V2_URL: The auth v2 url
- AUTH_V2_CLIENT_ID: The auth v2 client id
- AUTH_V3_URL: The auth v3 url
- ADMIN_CREDENTIALS_USERNAME: The user's username with admin role
- ADMIN_CREDENTIALS_PASSWORD: The user's password with admin role
- COPILOT_CREDENTIALS_USERNAME: The user's username with copilot role
- COPILOT_CREDENTIALS_PASSWORD: The user's password with copilot role
- USER_CREDENTIALS_USERNAME: The user's username with user role
- USER_CREDENTIALS_PASSWORD: The user's password with user role


### Prepare

- Start Local Postgres.
- Create Postgres tables and create test dat.
- Config `DATABASE_URL`
- Various config parameters should be properly set.

### Running unit tests

#### Setup Database for Tests

The Unit tests will clear all data in db. So it's better to setup db for test environment.

If you are using docker, you can run
```bash
docker run -d --name testdb -p 5430:5432 \
  -e POSTGRES_USER=johndoe -e POSTGRES_DB=testdb \
  -e POSTGRES_PASSWORD=mypassword \
  postgres:16.8

export DATABASE_URL="postgresql://johndoe:mypassword@localhost:5430/testdb?schema=public&statement_timeout=60000"
```
It will start a Postgres and listens to port `5430`. Technically you can run tests and application at the same time.

Be sure to export `DATABASE_URL` new value before running tests.


#### Running unit tests.

To run unit tests and generate coverage report.

```bash
npm run test
```

### Running E2E tests with Postman

#### `Start` the app server and mock API server before running e2e tests. You may need to set the env variables by calling `source env.sh` before calling `NODE_ENV=test npm start`.

- Make sure the db and es are started
```bash
  $ cd resources-api

    # NOTE:
    # if tables and data already exist, please run first

    # $ npm run drop-tables

    # to drop data and tables

    # Then re-initialize the es server and the database.

  $ npm run create-tables
  $ npm run init-db
```

To run postman e2e tests.

```bash
npm run test:newman
```

To clear the testing data from postman e2e tests.

```bash
npm run test:newman:clear
```

## Running tests in CI

- TBD

## Verification

Refer to the verification document `Verification.md`.
