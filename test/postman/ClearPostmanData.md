# Clear Testing data which are from Postman Tests

## How to clear the Postman related testing data
- To summarize, simply run below command after running the Postman tests.
```
  npm run test:newman:clear
```
- You should follow the ReadMe.md and Verification.md to run the tests. Then you will get output like below:
```
> NODE_ENV=test node test/postman/clearTestData.js

info: Clear the Postman test data.
clear the test data from postman test!
ResourceRole to be deleted addd9ae8-9610-4c20-9849-95587fbfa318
ResourceRolePhaseDependency to be deleted d775f701-e440-451d-b5cb-e675fd5db89e
ResourceRolePhaseDependency to be deleted 4aac6a0b-5375-4cc5-8af0-c3feb64ac51e
Resource to be deleted 82823bde-4acb-437a-8ab1-03aef7f30ea0
Resource to be deleted c02514c9-93ef-4da9-8771-df0fbb931d86
Resource to be deleted 262528be-94c3-4ae7-96be-9c643a54c457
Resource to be deleted 03eac62d-93ed-4be1-a061-4d58595d0833
Resource to be deleted e61a2997-f995-47ff-98ca-aeb42831aec1
Resource to be deleted 2572f829-1076-470e-b142-59d07cc59a1f
Resource to be deleted 2a9f228d-0981-48fd-80e7-988b23f1dc8c
Resource to be deleted 15093b6b-13aa-4f7c-964a-6b5708e302e4
Resource to be deleted eaf6b9c9-b0ca-4804-ba6f-654127d4feaf
ResourceRole to be deleted 9a72f8cb-93b3-4f3e-b9ed-7bbe09255521
ResourceRole to be deleted f722e872-897f-442f-980c-e92d00fe70fb
ResourceRole to be deleted 1d28eb17-4085-4269-b5a2-c73cc28aa5b9
ResourceRole to be deleted c4b53497-d6d2-43dc-b5bc-f09a681ae33a
ResourceRole to be deleted 47f3191d-1596-4155-b8da-35dc9288d820
ResourceRole to be deleted c5032dba-5da1-4846-a46c-845d74e880be
ResourceRole to be deleted 1da92cb3-8658-46d7-b147-4c913634fac1
clear the test data from postman test completed!
info: Done!
```
## Strategy
1. Setup the `POSTMAN_ROLE_NAME_PREFIX` from the test environment. This prefix should be a name that will never be used 
set as part of the role name. e.g. 'POSTMANE2E-'. In this case, the created `ResourceRole` will have a name like 'POSTMANE2E-submitter'.

2. Choose either one solution for mocking the Bus API. We can not ignore this, becuase in production environment, it is 
not allowed to send the Kafka messge to the Bus API.
a. Set `MOCK_BUS_API_BY_NOCK` to `true` from the test environment. In this way, Nock will return the response if any events
    is posted to the Bus API.
b. You can use use Postman's mock server. You can refer to https://drive.google.com/file/d/1GXMzyqpzwix-LDBwieiRFfpJlJxrTIgI/view?usp=sharing
   for details. You need to update the environment variable `BUSAPI_URL` to your Postman mock server.
  
3. Steps of clearing the test data from Postman tests.
   * Find all `ResourceRole` record whose names are starting with `POSTMAN_ROLE_NAME_PREFIX`.
   * For each `ResourceRole` record, find all `ResourceRolePhaseDependency` records whose `resourceRoleId` are the same 
     as the `id` of `RecourceRole`. Delete those `ResourceRolePhaseDependency` records.
   * For each `ResourceRole` record, find all `Resource` records whose `roleId` are the same
     as the `id` of `RecourceRole`.
     * Delete those `Resource` records.
     * Delete the ES index by the resource id too. (Only **Resource** are indexed by ES.)
   * Delete the `ResourceRole` record.

4. Note, in production enviroment, there is no need to run `npm run init-es force` or `npm run init-db`.

## Questions from the spec
* The DB is getting filled up with dummy/test data. You need to suggest a way to delete/clean up the data created from executing the tests without affecting existing data.  
  _Check above strategy section._
* Lookup data may not be required to get created as it may already exist or in some cases must not get created as there will be conflicts with existing data. You need to suggest how to overcome this issue.  
  _All data from the Postman tests can be easily deleted._
* Existing lookup data should not be deleted. You need to suggest how to avoid accidentally deleting lookup data.  
  _The Postman tests only use the testing data created by itself._
* Existing production data should not be affected by the tests. You need to suggest how to avoid this possible issue.  
  _Check the strategy section. All testing data are removed at last._
* If possible, we should be able to differentiate the test data from the actual data so we can filter it out from the search results of the production API. Please suggest how to achieve this.  
  _Check the strategy section. We can easy find all `ResourceRole` records with the given role name prefix. Then we can find all the related `ResourceRolePhaseDependency` and `Resource`._