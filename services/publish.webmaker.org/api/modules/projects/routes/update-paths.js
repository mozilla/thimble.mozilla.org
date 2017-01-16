"use strict";

const Joi = require(`joi`);

const Prerequisites = require(`../../../classes/prerequisites`);
const Errors = require(`../../../classes/errors`);

const ProjectsModel = require(`../model`);
const schema = require(`../schema`).updatePaths;
const projectsController = require(`../controller`);

// RPC route to update file paths for a project usually due to a folder rename
// The payload is expected to look something like:
// {
//   "/old/path/to/file1": "/new/path/to/file1",
//   "/old/path/to/file2": "/new/path/to/file2",
//   ...
// }
module.exports = [{
  method: `PUT`,
  path: `/projects/{id}/updatepaths`,
  config: {
    pre: [
      Prerequisites.confirmRecordExists(ProjectsModel, {
        mode: `param`,
        requestKey: `id`
      }),
      Prerequisites.validateUser(),
      Prerequisites.validateOwnership()
    ],
    handler: projectsController.updatePaths.bind(projectsController),
    description: `Update all file paths belonging to a project whose \`id\` ` +
      `is specified and change those files paths to the ones specified ` +
      `in the payload`,
    validate: {
      payload: schema,
      params: {
        id: Joi.number().integer().required()
      },
      failAction: Errors.attrs
    }
  }
}];
