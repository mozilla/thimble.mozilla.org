"use strict";

const Joi = require(`joi`);

const Prerequisites = require(`../../../classes/prerequisites`);
const Errors = require(`../../../classes/errors`);

const ProjectsModel = require(`../model`);
const schema = require(`../schema`).base;
const projectsController = require(`../controller`);

module.exports = [{
  method: `PUT`,
  path: `/projects/{id}`,
  config: {
    pre: [
      Prerequisites.confirmRecordExists(ProjectsModel, {
        mode: `param`,
        requestKey: `id`
      }),
      Prerequisites.validateUser(),
      Prerequisites.validateOwnership()
    ],
    handler: projectsController.update.bind(projectsController),
    description: `Update a single project object based on \`id\`.`,
    validate: {
      payload: schema,
      params: {
        id: Joi.number().integer().required()
      },
      failAction: Errors.attrs
    }
  }
}];
