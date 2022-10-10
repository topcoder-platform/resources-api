/**
 * App bootstrap
 */

require("dotenv").config();

global.Promise = require("bluebird");
const config = require("config");
const Joi = require("joi");

Joi.optionalId = () => Joi.string().uuid();
Joi.id = () => Joi.optionalId().required();
Joi.page = () => Joi.number().integer().min(1).default(1);
Joi.perPage = () =>
  Joi.number().integer().min(1).max(10000).default(config.DEFAULT_PAGE_SIZE);
