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
## Testing summary

The following scenarios have been tested:

- create resource role by admin
- create resource role by m2m
- create resource role with all kinds of invalid token
- update resource role by admin
- update resource role by m2m
- update resource role with all kinds of invalid token
- failure - update resource role invalid id 404
- create dependency by admin
- create dependency by m2m
- create dependency with all kinds of invalid token
- create dependency with not found phase id 404
- get all dependencies
- get matched dependencies
- get dependencies with all kinds of invalid token
- update dependency by admin
- update dependency by m2m
- update not found dependency 404
- update dependency with all kinds of invalid token
- delete dependency with all kinds of invalid token
- delete dependency with admin
- delete dependency with m2m
- create resource role with all kinds of invalid request body
- update resource role with all kinds of invalid request body
- get all resource roles
- get matched resource roles
- get resource roles with all kinds of invalid parameter
- create dependency with all kinds of invalid request body
- update dependency with all kinds of invalid request body
- get dependencies with all kinds of invalid parameter
- create resource by admin
- create resource using m2m token
- create resource with all kinds of invalid token
- create resource with all kinds of invalid request body
- get resources by required parameter only
- get resources with all parameters
- get resources with all kinds of invalid parameter
- get challenges by member with different users
- get challenges by member with resource role
- get challenges by member with all kinds of invalid token
- get challenges by member with all kinds of invalid parameter
- delete resource with all kinds of invalid token
- delete resource with all kinds of invalid parameter
- delete resource with admin
- delete resource with m2m

### Roles tested

- M2M
- Admin
- Copilot
- User
