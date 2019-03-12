/**
 * This defines ChallengeSetting model.
 */

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
      throughput: { read: 2, write: 2 }
    }
  },
  memberId: {
    type: String,
    required: true
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
  throughput: { read: 4, write: 2 }
})

module.exports = schema
