"use strict";

const Joi = require(`joi`);

const Errors = require(`../../../classes/errors`);
const Prerequistes = require(`../../../classes/prerequisites`);

const FilesModel = require(`../model`);
const filesController = require(`../controller`);

module.exports = [{
  method: `DELETE`,
  path: `/files/{id}`,
  config: {
    pre: [
      Prerequistes.confirmRecordExists(FilesModel, {
        mode: `param`,
        requestKey: `id`
      }),
      Prerequistes.validateUser(),
      Prerequistes.validateOwnership()
    ],
    handler: filesController.delete.bind(filesController),
    description: `Delete a single file object based on \`id\`.`,
    validate: {
      params: {
        id: Joi.number().integer().required()
      },
      failAction: Errors.id
    }
  }
}];
