"use strict";

const Errors = require(`../../../classes/errors`);

const schema = require(`../schema`);
const usersController = require(`../controller`);

module.exports = [{
  method: `POST`,
  path: `/users/login`,
  config: {
    handler: usersController.login.bind(usersController),
    description: `Retrieve the user with the passed username, creating if necessary.`,
    validate: {
      payload: schema,
      failAction: Errors.attr
    }
  }
}];
