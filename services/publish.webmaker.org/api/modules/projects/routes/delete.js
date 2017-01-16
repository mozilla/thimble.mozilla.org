"use strict";

const Joi = require(`joi`);

const Prerequisites = require(`../../../classes/prerequisites`);
const Errors = require(`../../../classes/errors`);

const ProjectsModel = require(`../model`);
const projectsController = require(`../controller`);

module.exports = [{
  method: `DELETE`,
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
    handler: projectsController.delete.bind(projectsController),
    description: `Delete a single project object based on \`id\`.`,
    validate: {
      params: {
        id: Joi.number().integer().required()
      },
      failAction: Errors.id
    }
  }
}];
