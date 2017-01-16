"use strict";

const Errors = require(`../../../classes/errors`);

const usersController = require(`../controller`);
const schema = require(`../schema`);

module.exports = [{
  method: `POST`,
  path: `/users`,
  config: {
    handler: usersController.login.bind(usersController),
    description: `Create a new user object.`,
    validate: {
      payload: schema,
      failAction: Errors.attrs
    }
  }
}];
