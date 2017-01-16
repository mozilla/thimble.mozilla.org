"use strict";

var Joi = require(`joi`);

var Prerequisites = require(`../../../classes/prerequisites`);
var Errors = require(`../../../classes/errors`);

var UsersModel = require(`../model`);
var usersController = require(`../controller`);

module.exports = [{
  method: `GET`,
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
    handler: usersController.getOne.bind(usersController),
    description: `Retrieve a single user object based on \`id\`.`,
    validate: {
      params: {
        id: Joi.number().integer().required()
      },
      failAction: Errors.id
    }
  }
}];
