/**
 * This defines Resource model.
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
  challengeId: {
    type: String,
    required: true,
    index: {
      global: true,
      rangeKey: 'memberId',
      project: true,
      name: 'resource-challengeIdMemberId-index',
      throughput: { read: config.DYNAMODB.AWS_READ_UNITS, write: config.DYNAMODB.AWS_WRITE_UNITS }
    }
  },
  memberId: {
    type: String,
    required: true,
    index: {
      global: true,
      rangeKey: 'roleId',
      project: true,
      name: 'resource-memberIdRoleId-index',
      throughput: { read: config.DYNAMODB.AWS_READ_UNITS, write: config.DYNAMODB.AWS_WRITE_UNITS }
    }
  },
  memberHandle: {
    type: String,
    required: true
  },
  roleId: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    required: true
  },
  createdBy: {
    type: String,
    required: false
  },
  updated: {
    type: Date,
    required: false
  },
  updatedBy: {
    type: String,
    required: false
  }
},
{
  throughput: { read: config.DYNAMODB.AWS_READ_UNITS, write: config.DYNAMODB.AWS_WRITE_UNITS }
})

module.exports = schema
