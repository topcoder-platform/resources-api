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
-  [ES Processor](https://github.com/topcoder-platform/challenge-processor-es) - Updates data in ElasticSearch
-  [Legacy Processor](https://github.com/topcoder-platform/legacy-challenge-processor) - Moves data from DynamoDB back to Informix
-  [Legacy Migration Script](https://github.com/topcoder-platform/legacy-challenge-migration-script) - Moves data from Informix to DynamoDB
-  [Frontend App](https://github.com/topcoder-platform/challenge-engine-ui)

## Prerequisites
-  [NodeJS](https://nodejs.org/en/) (v10)
-  [DynamoDB](https://aws.amazon.com/dynamodb/)
-  [ElasticSearch](https://www.elastic.co/)
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
- DYNAMODB.AWS_ACCESS_KEY_ID: The Amazon certificate key to use when connecting. Use local dynamodb you can set fake value
- DYNAMODB.AWS_SECRET_ACCESS_KEY: The Amazon certificate access key to use when connecting. Use local dynamodb you can set fake value
- DYNAMODB.AWS_REGION: The Amazon certificate region to use when connecting. Use local dynamodb you can set fake value
- DYNAMODB.IS_LOCAL: Use Amazon DynamoDB Local or server.
- DYNAMODB.URL: The local url if using Amazon DynamoDB Local
- DYNAMODB.AWS_READ_UNITS: The DynamoDB table read unit configuration, default is 4
- DYNAMODB.AWS_WRITE_UNITS: The DynamoDB table write unit configuration, default is 2
- DYNAMODB.TIMEOUT: The timeout setting used in health check
- SCOPES: The M2M scopes, refer `config/default.js` for more information
- ES.HOST: Elasticsearch host, default value is 'localhost:9200'
- ES.API_VERSION: Elasticsearch API version, default value is '6.8'
- ES.ES_INDEX: Elasticsearch index name for resources, default value is 'resources'
- ES.ES_TYPE: Elasticsearch index type for resources, default value is '_doc'
- ES.ES_REFRESH: Elasticsearch force refresh flag, default value is 'true'
- BUSAPI_URL: the bus api, default value is 'https://api.topcoder-dev.com/v5'
- KAFKA_ERROR_TOPIC: Kafka error topic, default value is 'common.error.reporting',
- KAFKA_MESSAGE_ORIGINATOR: the Kafka message originator, default value is 'resources-api'
- RESOURCE_CREATE_TOPIC: the resource create Kafka topic, default value is 'challenge.action.resource.create',
- RESOURCE_DELETE_TOPIC: the resource delete Kafka topic, default value is 'challenge.action.resource.delete',
- RESOURCE_ROLE_CREATE_TOPIC: the resource role create topic, default value is 'challenge.action.resource.role.create',
- RESOURCE_ROLE_UPDATE_TOPIC: the resource role update topic, default value is 'challenge.action.resource.role.update'

Configuration for testing is at `config/test.js`, only add such new configurations different from `config/default.js`
- WAIT_TIME: wait time used in test, default is 1500 or 1.5 second
- MOCK_CHALLENGE_API_PORT: the mock server port, default is 4000.

## Available commands
- Install dependencies `npm install`
- Run lint `npm run lint`
- Run lint fix `npm run lint:fix`
- Create tables `npm run create-tables`
- Drop tables `npm run drop-tables`
- Create tables for test environment `npm run create-tables:test`
- Drop tables for test environment `npm run drop-tables:test`
- Clear and init db `npm run init-db`
- Initialize ElasticSearch `npm run init-es`
- Start app `npm start`
- App is running at `http://localhost:3000`
- Start mock server `npm run mock-challenge-api`
- The mock server is running at `http://localhost:4000`

## Local Deployment
### Foreman Setup
To install foreman follow this [link](https://theforeman.org/manuals/1.24/#3.InstallingForeman)

To know how to use foreman follow this [link](https://theforeman.org/manuals/1.24/#2.Quickstart)


### DynamoDB Setup

We can use DynamoDB setup on Docker for testing purpose. Just run `docker-compose up` in `local` folder.

You can also use your own AWS DynamoDB service for testing purpose.

### Create Tables

1. Make sure DynamoDB are running as per instructions above.
2. Make sure you have configured all config parameters. Refer [Configuration](#configuration)
3. Run `npm run create-tables` to create tables.

### ElasticSearch Setup

We can use ElasticSearch on Docker for testing purpose. Just run `docker-compose up` in `local` folder.

You can also use your own remote ElasticSearch service for testing purpose.

### Create ElasticSearch Index

1. Makre sure ElasticSearch are running as per instructions above.
2. Make sure you have configured all config parameters. Refer [Configuration](#configuration)
3. Run `npm run init-es force` to create index.

### Mock Challenge V5 API

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


### Prepare

- Start Local DynamoDB.
- Create DynamoDB tables.
- Start Local ElasticSearch.
- Create ElasticSearch index.
- Various config parameters should be properly set.

### Running unit tests

#### You need to `stop` the app server and mock API server before running unit tests.

To run unit tests and generate coverage report.

```bash
npm run test
```

### Running E2E tests with Postman

#### `Start` the app server and mock API server before running e2e tests. You may need to set the env variables by calling `source env.sh` before calling `npm start`.

- Make sure the db and es are started
```bash
  $ cd resources-api

    # NOTE:
    # if tables and data already exist, please run first

    # $ npm run drop-tables

    # to drop data and tables

    # Then re-initialize the es server and the database.

  $ npm run create-tables
  $ npm run init-es force
  $ npm run init-db
```

To run postman e2e tests.

```bash
npm run test:newman
```

## Running tests in CI
- TBD

## Verification

Refer to the verification document `Verification.md`.