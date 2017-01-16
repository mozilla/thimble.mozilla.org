"use strict";

const Joi = require(`joi`);

const Errors = require(`../../../classes/errors`);
const Prerequisites = require(`../../../classes/prerequisites`);

const UsersModel = require(`../model`);
const usersController = require(`../controller`);

module.exports = [{
  method: `DELETE`,
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
    handler: usersController.delete.bind(usersController),
    description: `Delete a user object based on  \`id\`.`,
    validate: {
      params: {
        id: Joi.number().integer().required()
      },
      failAction: Errors.id
    }
  }
}];
