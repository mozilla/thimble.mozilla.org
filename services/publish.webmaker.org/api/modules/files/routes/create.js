"use strict";

const Prerequistes = require(`../../../classes/prerequisites`);
const Errors = require(`../../../classes/errors`);

const ProjectsModel = require(`../../projects/model`);

const schema = require(`../schema`);
const filesController = require(`../controller`);

module.exports = [{
  method: `POST`,
  path: `/files`,
  config: {
    payload: {
      allow: `multipart/form-data`,
      parse: true,
      output: `file`,
      maxBytes: process.env.FILE_SIZE_LIMIT || 1048576 * 5 // 5mb
    },
    pre: [
      Prerequistes.trackTemporaryFile(),
      Prerequistes.validateCreationPermission(`project_id`, ProjectsModel)
    ],
    handler: filesController.create.bind(filesController),
    description: `Create a new file object.`,
    validate: {
      payload: schema,
      failAction: Errors.attrs
    }
  }
}];
