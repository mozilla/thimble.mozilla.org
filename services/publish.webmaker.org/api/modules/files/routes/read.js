"use strict";

const Joi = require(`joi`);

const Errors = require(`../../../classes/errors`);
const Prerequisites = require(`../../../classes/prerequisites`);

const FilesModel = require(`../model`);
const filesController = require(`../controller`);

module.exports = [{
  method: `GET`,
  path: `/files/{id}`,
  config: {
    pre: [
      Prerequisites.confirmRecordExists(FilesModel, {
        mode: `param`,
        requestKey: `id`
      }),
      Prerequisites.validateUser(),
      Prerequisites.validateOwnership()
    ],
    handler: filesController.getOne.bind(filesController),
    description: `Retrieve a single file object based on \`id\`.`,
    validate: {
      params: {
        id: Joi.number().integer().required()
      },
      failAction: Errors.id
    }
  }
}, {
  method: `GET`,
  path: `/projects/{project_id}/files`,
  config: {
    pre: [
      Prerequisites.confirmRecordExists(FilesModel, {
        mode: `param`,
        requestKey: `project_id`
      }),
      Prerequisites.validateUser(),
      Prerequisites.validateOwnership()
    ],
    handler: filesController.getAll.bind(filesController),
    description: `Retrieve a collection of file objects that belong to ` +
      `a single project object, based on \`project_id\`.`,
    validate: {
      params: {
        project_id: Joi.number().integer().required()
      },
      failAction: Errors.id
    }
  }
}, {
  method: `GET`,
  path: `/projects/{project_id}/files/meta`,
  config: {
    pre: [
      Prerequisites.confirmRecordExists(FilesModel, {
        mode: `param`,
        requestKey: `project_id`,
        columns: [`id`, `project_id`, `path`]
      }),
      Prerequisites.validateUser(),
      Prerequisites.validateOwnership()
    ],
    handler: filesController.getAllAsMeta.bind(filesController),
    description: `Retrieve a collection of file objects that belong to ` +
      `a single project object, based on \`project_id\`.`,
    validate: {
      params: {
        project_id: Joi.number().integer().required()
      },
      failAction: Errors.id
    }
  }
}, {
  method: `GET`,
  path: `/projects/{project_id}/files/tar`,
  config: {
    pre: [
      Prerequisites.confirmRecordExists(FilesModel, {
        mode: `param`,
        requestKey: `project_id`,
        columns: [`id`, `path`]
      }),
      Prerequisites.validateUser(),
      Prerequisites.validateOwnership()
    ],
    handler: filesController.getAllAsTar.bind(filesController),
    description: `Retrieve a tar file containing a collection of file ` +
    `objects that belong to a single project object, based on ` +
    `\`project_id\`.`,
    validate: {
      params: {
        project_id: Joi.number().integer().required()
      },
      failAction: Errors.id
    }
  }
}];
