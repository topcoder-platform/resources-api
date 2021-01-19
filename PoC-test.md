# Postman PoC test
## Prerequisite
- start db and es:
  ```bash
  $ cd resources-api/local
  $ docker-compose up
  ```
- create tables:
  ```bash
  $ cd resources-api

    # NOTE:
    # if tables and data already exist, please run first

    # $ npm run drop-tables:test

    # to drop data and tables

  $ npm run create-tables:test
  ```
- start mock challenge api:
  ```
  $ cd resources-api/mock
  $ npm run mock-challenge-api
  ```
- start app
  ```bash
  $ cd resources-api
  $ source env.sh            # set env variables
  $ NODE_ENV=test npm start
  ```

## newman test
  ```bash
  $ npm run test:newman
  ```

## Postman test
Please refer to: https://drive.google.com/file/d/1VcTtNwI5_TXgnEKT4TruqG0Z-ts0J83G/view?usp=sharing


## Postman mock server
E2E tests use nock to mock `BUSAPI_URL`, where postman mock server could be used to replace nock.
Please refer to: https://drive.google.com/file/d/1GXMzyqpzwix-LDBwieiRFfpJlJxrTIgI/view?usp=sharing