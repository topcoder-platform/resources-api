/**
 * Initialize and export all model schemas.
 */

const config = require('config')
const dynamoose = require('dynamoose')

const awsConfigs = config.DYNAMODB.IS_LOCAL_DB ? {
  accessKeyId: config.DYNAMODB.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.DYNAMODB.AWS_SECRET_ACCESS_KEY,
  region: config.DYNAMODB.AWS_REGION
} : {
  region: config.DYNAMODB.AWS_REGION
}

dynamoose.AWS.config.update(awsConfigs)

if (config.DYNAMODB.IS_LOCAL_DB) {
  dynamoose.local(config.DYNAMODB.URL)
}

dynamoose.setDefaults({
  create: false,
  update: false,
  waitForActive: false
})

// console.log(config.DYNAMODB.IS_LOCAL_DB, config.DYNAMODB.AWS_ACCESS_KEY_ID, config.DYNAMODB.AWS_SECRET_ACCESS_KEY)
// console.log(JSON.stringify(dynamoose.AWS.config))

module.exports = {
  DynamoDB: dynamoose.ddb(),
  Resource: dynamoose.model('Resource', require('./Resource')),
  ResourceRole: dynamoose.model('ResourceRole', require('./ResourceRole')),
  ResourceRolePhaseDependency: dynamoose.model('ResourceRolePhaseDependency', require('./ResourceRolePhaseDependency')),
  MemberStats: dynamoose.model('MemberStats', require('./MemberStats')),
  MemberProfile: dynamoose.model('MemberProfile', require('./MemberProfile'))
}
