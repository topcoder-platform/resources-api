/**
 * App bootstrap
 */

global.Promise = require('bluebird')
const Joi = require('joi')

Joi.id = () => Joi.string().uuid().required()
