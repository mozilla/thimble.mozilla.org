"use strict";

const Joi = require(`joi`);

const Errors = require(`../../../classes/errors`);
const Prerequisites = require(`../../../classes/prerequisites`);

const PublishedProjectsModel = require(`../model`);
const publishedProjectsController = require(`../controller`);

module.exports = [{
  method: `GET`,
  path: `/publishedProjects/{id}`,
  config: {
    auth: false,
    pre: [
      Prerequisites.confirmRecordExists(PublishedProjectsModel, {
        mode: `param`,
        requestKey: `id`
      })
    ],
    handler: publishedProjectsController.getOne.bind(publishedProjectsController),
    description: `Retrieve a single published project object based on \`id\`.`,
    validate: {
      params: {
        id: Joi.number().integer().required()
      },
      failAction: Errors.id
    }
  }
}, {
  method: `GET`,
  path: `/publishedProjects`,
  config: {
    auth: false,
    pre: [
      Prerequisites.confirmRecordExists(PublishedProjectsModel)
    ],
    handler: publishedProjectsController.getAll.bind(publishedProjectsController),
    description: `Retrieve a collection of published project objects.`
  }
}];
