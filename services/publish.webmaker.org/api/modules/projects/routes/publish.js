"use strict";

const Prerequisites = require(`../../../classes/prerequisites`);

const ProjectsModel = require(`../model`);
const projectsController = require(`../controller`);

module.exports = [{
  method: `PUT`,
  path: `/projects/{id}/publish`,
  config: {
    pre: [
      Prerequisites.confirmRecordExists(ProjectsModel, {
        mode: `param`,
        requestKey: `id`
      }),
      Prerequisites.validateUser(),
      Prerequisites.validateOwnership()
    ],
    handler: projectsController.publish.bind(projectsController),
    description: `Publish a project.`
  }
}, {
  method: `PUT`,
  path: `/projects/{id}/unpublish`,
  config: {
    pre: [
      Prerequisites.confirmRecordExists(ProjectsModel, {
        mode: `param`,
        requestKey: `id`
      }),
      Prerequisites.validateUser(),
      Prerequisites.validateOwnership()
    ],
    handler: projectsController.unpublish.bind(projectsController),
    description: `Unpublish a project.`
  }
}];
