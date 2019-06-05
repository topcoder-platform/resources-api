# Topcoder Challenge Resources API

## Dependencies

- nodejs https://nodejs.org/en/ (v10)
- DynamoDB
- Docker, Docker Compose

## Configuration

Configuration for the application is at `config/default.js`.
The following parameters can be set in config files or in env variables:

- LOG_LEVEL: the log level, default is 'debug'
- PORT: the server port, default is 3000
- AUTH_SECRET: The authorization secret used during token verification.
- VALID_ISSUERS: The valid issuer of tokens, a json array contains valid issuer.
- AUTH0_URL: Auth0 URL, used to get TC M2M token
- AUTH0_AUDIENCE: Auth0 audience, used to get TC M2M token
- TOKEN_CACHE_TIME: Auth0 token cache time, used to get TC M2M token
- AUTH0_CLIENT_ID: Auth0 client id, used to get TC M2M token
- AUTH0_CLIENT_SECRET: Auth0 client secret, used to get TC M2M token
- AUTH0_PROXY_SERVER_URL: Proxy Auth0 URL, used to get TC M2M token
- MEMBER_API_URL: Member api url, default is 'https://api.topcoder-dev.com/v3/members'
- CHALLENGE_API_URL: Challenge api url, default is 'http://localhost:4000/v5/challenges'.
- DYNAMODB.AWS_ACCESS_KEY_ID: The Amazon certificate key to use when connecting. Use local dynamodb you can set fake value
- DYNAMODB.AWS_SECRET_ACCESS_KEY: The Amazon certificate access key to use when connecting. Use local dynamodb you can set fake value
- DYNAMODB.AWS_REGION: The Amazon certificate region to use when connecting. Use local dynamodb you can set fake value
- DYNAMODB.IS_LOCAL: Use Amazon DynamoDB Local or server.
- DYNAMODB.URL: The local url if using Amazon DynamoDB Local
- DYNAMODB.TIMEOUT: The timeout setting used in health check
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

## DynamoDB Setup with Docker
We will use DynamoDB setup on Docker.

Just run `docker-compose up` in local folder

If you have already installed aws-cli in your local machine, you can execute `./local/init-dynamodb.sh` to
create the table. If not you can still create table following `Create Table via awscli in Docker`.

## Create Table via awscli in Docker
1. Make sure DynamoDB are running as per instructions above.

2. Run the following commands
```
docker exec -ti dynamodb sh
```
Next
```
./init-dynamodb.sh
```

3. Now the tables have been created, you can use following command to verify
```
aws dynamodb scan --table-name Resource --endpoint-url http://localhost:7777
aws dynamodb scan --table-name ResourceRole --endpoint-url http://localhost:7777
```

## Mock Challenge V5 API
As per specification, /v5/challenges/{id} endpoint does not exist thus need to mock it for this challenge. It is a simple server app, the code is under mock folder.
You can start the mock server using command `npm run mock-challenge-api`.

## Scripts
1. Creating tables: `npm run create-tables`
2. Drop/delete tables: `npm run drop-tables`
3. Seed/Insert data to tables: `npm run seed-tables`

## Local Deployment

- Install dependencies `npm install`
- Run lint `npm run lint`
- Run lint fix `npm run lint:fix`
- Start app `npm start`
- App is running at `http://localhost:3000`
- Start mock server `npm run mock-challenge-api`
- The mock server is running at `http://localhost:4000`
- Clear and init db `npm run init-db`

## Testing
#### You need to `stop` the app and mock server before running unit or e2e tests.
- Run `npm run test` to execute unit tests.
- RUN `npm run e2e` to execute e2e tests.

## Verification
Refer to the verification document `Verification.md`
