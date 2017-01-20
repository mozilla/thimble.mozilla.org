"use strict";

const Prerequisites = require(`../../../classes/prerequisites`);
const Errors = require(`../../../classes/errors`);

const schema = require(`../schema`).base;
const projectsController = require(`../controller`);

module.exports = [{
  method: `POST`,
  path: `/projects`,
  config: {
    pre: [
      Prerequisites.validateCreationPermission()
    ],
    handler: projectsController.create.bind(projectsController),
    description: `Create a new project object.`,
    validate: {
      payload: schema,
      failAction: Errors.attrs
    }
  }
}];
