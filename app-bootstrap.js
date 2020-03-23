/**
 * App bootstrap
 */

global.Promise = require('bluebird')
const Joi = require('joi')

Joi.optionalId = () => Joi.string().uuid()
Joi.id = () => Joi.string().uuid().required()
