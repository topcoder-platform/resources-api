# Topcoder Challenge Resources API

## Dependencies

- nodejs https://nodejs.org/en/ (v10)
- DynamoDB
- Elasticsearch 6.8.4
- Docker, Docker Compose

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
- MEMBER_API_URL: Member api url, default is 'https://api.topcoder-dev.com/v3/members'
- USER_API_URL: User api url, default is 'https://api.topcoder-dev.com/v3/users'
- CHALLENGE_API_URL: Challenge api url, default is 'http://localhost:4000/v5/challenges'.
- DYNAMODB.AWS_ACCESS_KEY_ID: The Amazon certificate key to use when connecting. Use local dynamodb you can set fake value
- DYNAMODB.AWS_SECRET_ACCESS_KEY: The Amazon certificate access key to use when connecting. Use local dynamodb you can set fake value
- DYNAMODB.AWS_REGION: The Amazon certificate region to use when connecting. Use local dynamodb you can set fake value
- DYNAMODB.IS_LOCAL: Use Amazon DynamoDB Local or server.
- DYNAMODB.URL: The local url if using Amazon DynamoDB Local
- DYNAMODB.AWS_READ_UNITS: The DynamoDB table read unit configuration, default is 4
- DYNAMODB.AWS_WRITE_UNITS: The DynamoDB table write unit configuration, default is 2
- DYNAMODB.TIMEOUT: The timeout setting used in health check
- ES.AWS_REGION: The Amazon certificate region to use when connecting to AWS ES
- ES.HOST: Elasticsearch host
- ES.API_VERSION: Elasticsearch API version
- ES.RESOURCE_INDEX: Elasticsearch index name for resources
- ES.RESOURCE_TYPE: Elasticsearch index type for resources
- ES.RESOURCE_ROLE_INDEX: Elasticsearch index name for resource roles
- ES.RESOURCE_ROLE_TYPE: Elasticsearch index type for resource roles
- SCOPES: The M2M scopes, refer `config/default.js` for more information
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

## DynamoDB and ElasticSearch Setup

Just run `docker-compose up` in `local` folder.


## Create Tables
1. Make sure DynamoDB are running as per instructions above.
2. Make sure you have configured all config parameters. Refer [Configuration](#configuration)
3. Run `npm run create-tables` to create tables.

## Mock Challenge V5 API
As per specification, /v5/challenges/{id} endpoint does not exist thus need to mock it for this challenge. It is a simple server app, the code is under mock folder.
You can start the mock server using command `npm run mock-challenge-api`.

## Scripts
1. Creating tables: `npm run create-tables`
2. Drop/delete tables: `npm run drop-tables`
3. Seed/Insert data to tables: `npm run seed-tables`
4. Initialize database in default environment: `npm run init-db`
5. View table data in default environment: `npm run view-data <ModelName>`, ModelName can be `Resource` or `ResourceRole`
6. Initialize indices in Elasticsearch: `npm run init-es`

## Local Deployment

- Install dependencies `npm install`
- Run lint `npm run lint`
- Run lint fix `npm run lint:fix`
- Create tables `npm run create-tables`
- Clear and init db `npm run init-db`
- Initialize ES indices `npm run init-es`
- Start app `npm start`
- App is running at `http://localhost:3000`
- Start mock server `npm run mock-challenge-api`
- The mock server is running at `http://localhost:4000`

## Testing

- You need to `stop` the app and mock server before running unit or e2e tests.
- DynamoDB should be running with tables created
- Elasticsearch should be running
- Run `npm run test` to execute unit tests and generate coverage report.
- RUN `npm run e2e` to execute e2e tests and generate coverage report.
- Note that all Elasticsearch and DynamoDB data will be cleared after running unit/e2e tests.


## Verification
Refer to the verification document `Verification.md`
