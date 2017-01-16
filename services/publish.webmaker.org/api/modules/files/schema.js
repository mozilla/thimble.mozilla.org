"use strict";

const Joi = require(`joi`);

module.exports = Joi.object().keys({
  path: Joi.string().required(),
  project_id: Joi.number().integer().required(),
  buffer: Joi.object().required()
});
