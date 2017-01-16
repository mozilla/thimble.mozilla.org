"use strict";

const Joi = require(`joi`);

const Errors = require(`../../../classes/errors`);
const Prerequisites = require(`../../../classes/prerequisites`);

const UsersModel = require(`../model`);
const usersController = require(`../controller`);
const schema = require(`../schema`);

module.exports = [{
  method: `PUT`,
  path: `/users/{id}`,
  config: {
    pre: [
      Prerequisites.confirmRecordExists(UsersModel, {
        mode: `param`,
        requestKey: `id`
      }),
      Prerequisites.validateUser(),
      Prerequisites.validateOwnership()
    ],
    handler: usersController.update.bind(usersController),
    description: `Update a user object based on \`id\`.`,
    validate: {
      payload: schema,
      params: {
        id: Joi.number().integer().required()
      },
      failAction: Errors.id
    }
  }
}];
