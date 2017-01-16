"use strict";

const Joi = require(`joi`);

const Errors = require(`../../../classes/errors`);
const Prerequisites = require(`../../../classes/prerequisites`);

const ProjectsModel = require(`../model`);
const projectsController = require(`../controller`);

module.exports = [{
  method: `GET`,
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
    handler: projectsController.getOne.bind(projectsController),
    description: `Retrieve a single project object based on \`id\`.`,
    validate: {
      params: {
        id: Joi.number().integer().required()
      },
      failAction: Errors.id
    }
  }
}, {
  method: `GET`,
  path: `/users/{user_id}/projects`,
  config: {
    pre: [
      Prerequisites.confirmRecordExists(ProjectsModel, {
        mode: `param`,
        requestKey: `user_id`
      }),
      Prerequisites.validateUser(),
      Prerequisites.validateOwnership()
    ],
    handler: projectsController.getAll.bind(projectsController),
    description: `Retrieve a collection of project objects belonging to a single user object, based on \`user_id\`.`,
    validate: {
      params: {
        user_id: Joi.number().integer().required()
      },
      failAction: Errors.id
    }
  }
}];
