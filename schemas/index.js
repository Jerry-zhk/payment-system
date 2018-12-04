const Joi = require('joi');

// const userSchema = Joi.object
const username = Joi.string().regex(/^[A-Za-z0-9]+$/).required();

const display_name = Joi.string().regex(/^[A-Za-z0-9 ]+$/).required();

const password = Joi.string().regex(/^[A-Za-z0-9]+$/).min(6).required();

const requestId = Joi.number().required();

const amount = Joi.number().min(0).required();

const description = Joi.string().allow('');

const lifetime = Joi.number().min(0).optional();

module.exports = {
  username,
  display_name,
  password,
  requestId,
  amount,
  description,
  lifetime
}