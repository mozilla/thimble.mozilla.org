"use strict";

const Prerequisites = require(`../../../classes/prerequisites`);

const ProjectsModel = require(`../model`);
const projectsController = require(`../controller`);
const schema = require(`../schema`).publishQuery;

module.exports = [{
  // Query String params allowed:
  // - readonly : (Optional) Its value can either be true or false.
  // Sets the readonly property of projects before publishing.
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
    description: `Publish a project.`,
    validate: {
      query: schema
    }
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
