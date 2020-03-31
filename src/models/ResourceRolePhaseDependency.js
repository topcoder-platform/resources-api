/**
 * This defines ResourceRolePhaseDependency model.
 */

const config = require('config')
const dynamoose = require('dynamoose')

const Schema = dynamoose.Schema

const schema = new Schema({
  id: {
    type: String,
    hashKey: true,
    required: true
  },
  phaseId: {
    type: String,
    required: true
  },
  resourceRoleId: {
    type: String,
    required: true
  },
  phaseState: {
    type: Boolean,
    required: true
  }
},
{
  throughput: { read: config.DYNAMODB.AWS_READ_UNITS, write: config.DYNAMODB.AWS_WRITE_UNITS }
})

module.exports = schema
