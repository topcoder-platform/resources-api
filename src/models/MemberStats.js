/**
 * This defines ResourceRole model.
 */

const config = require('config')
const dynamoose = require('dynamoose')

const Schema = dynamoose.Schema

const schema = new Schema({
  userId: {
    type: Number,
    hashKey: true,
    required: true
  },
  handle: {
    type: String
  },
  handleLower: {
    type: String,
    index: {
      global: true,
      name: 'handleLower-index',
      project: true
    }
  },
  maxRating: {
    type: Object
  }
},
{
  throughput: { read: config.DYNAMODB.AWS_READ_UNITS, write: config.DYNAMODB.AWS_WRITE_UNITS }
})

module.exports = schema
