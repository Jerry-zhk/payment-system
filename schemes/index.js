const Joi = require('joi');

const username = Joi.string().regex(/^[A-Za-z0-9]+$/).required();

const display_name = Joi.string().regex(/^[A-Za-z0-9 ]+$/).required();

const password = Joi.string().regex(/^[A-Za-z0-9]+$/).min(6).required();

module.exports = {
  username,
  display_name,
  password
}