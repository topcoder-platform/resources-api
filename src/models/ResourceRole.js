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
  nameLower: {
    type: String,
    required: true,
    index: {
      global: true,
      project: true,
      name: 'resourceRole-nameLower-index',
      throughput: { read: 2, write: 2 }
    }
  }
},
{
  throughput: { read: 4, write: 2 }
})

module.exports = schema
