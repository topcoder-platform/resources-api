/**
 * This defines ResourceRole model.
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
  name: {
    type: String,
    required: true
  },
  fullAccess: {
    type: Boolean,
    required: true
  },
  isActive: {
    type: Boolean,
    required: true
  },
  selfObtainable: {
    type: Boolean,
    required: true
  },
  nameLower: {
    type: String,
    required: true,
    index: {
      global: true,
      project: true,
      name: 'resourceRole-nameLower-index',
      throughput: { read: config.DYNAMODB.AWS_READ_UNITS, write: config.DYNAMODB.AWS_WRITE_UNITS }
    }
  }
},
{
  throughput: { read: config.DYNAMODB.AWS_READ_UNITS, write: config.DYNAMODB.AWS_WRITE_UNITS }
})

module.exports = schema
