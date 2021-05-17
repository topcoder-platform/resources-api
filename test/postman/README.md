# Automated testing using Postman + Newman
## Configurations

- All configurations are set in [/config/test.js](../../config/test.js).
- All test data is set in [/test/postman/testData](testData/).

## Running the tests locally

- Follow the steps from the [Readme](../../ReadMe.md)

## Running the tests on CircleCI

- With every commit in the `develop` branch, and after the API is deployed on the development environment, a `Run-Newman-Test` job is created on CircleCI.
- You need to approve this step in order to trigger the test execution.
- The progress as well as the results can be monitored within CircleCI and the final result (pass/fail) will also be visible on the repository page on Github.
- If you simply want to trigger the tests, you can either rerun the test workflow from within CircleCI or push an empty commit to trigger a new deployment.

## Next Step - Running the tests on CircleCI Master 
