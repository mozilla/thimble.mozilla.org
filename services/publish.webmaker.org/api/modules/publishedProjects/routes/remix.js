"use strict";

var Prerequisites = require(`../../../classes/prerequisites`);

var PublishedProjectsModel = require(`../model`);
var publishedProjectsController = require(`../controller`);

module.exports = [{
  path: `/publishedProjects/{id}/remix`,
  method: `PUT`,
  config: {
    pre: [
      Prerequisites.confirmRecordExists(PublishedProjectsModel, {
        mode: `param`,
        requestKey: `id`
      }),
      Prerequisites.validateUser()
    ],
    handler: publishedProjectsController.remix.bind(publishedProjectsController),
    description: `Create a new project object.`
  }
}];
