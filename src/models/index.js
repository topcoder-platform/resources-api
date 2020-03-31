/**
 * Initialize and export all model schemas.
 */

const config = require('config')
const dynamoose = require('dynamoose')

dynamoose.AWS.config.update({
  // accessKeyId: config.DYNAMODB.AWS_ACCESS_KEY_ID,
  // secretAccessKey: config.DYNAMODB.AWS_SECRET_ACCESS_KEY,
  region: config.DYNAMODB.AWS_REGION
})

if (config.DYNAMODB.IS_LOCAL) {
  dynamoose.local(config.DYNAMODB.URL)
}

dynamoose.setDefaults({
  create: false,
  update: true
})

module.exports = {
  DynamoDB: dynamoose.ddb(),
  Resource: dynamoose.model('Resource', require('./Resource')),
  ResourceRole: dynamoose.model('ResourceRole', require('./ResourceRole')),
  ResourceRolePhaseDependency: dynamoose.model('ResourceRolePhaseDependency', require('./ResourceRolePhaseDependency'))
}
