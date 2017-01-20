"use strict";

var Joi = require(`joi`);

var Errors = require(`../../../classes/errors`);
var Prerequisites = require(`../../../classes/prerequisites`);

var FilesModel = require(`../model`);
var schema = require(`../schema`);
var filesController = require(`../controller`);

module.exports = [{
  method: `PUT`,
  path: `/files/{id}`,
  config: {
    payload: {
      allow: `multipart/form-data`,
      parse: true,
      output: `file`,
      maxBytes: process.env.FILE_SIZE_LIMIT || 1048576 * 5 // 5mb
    },
    pre: [
      Prerequisites.trackTemporaryFile(),
      Prerequisites.confirmRecordExists(FilesModel, {
        mode: `param`,
        requestKey: `id`
      }),
      Prerequisites.validateUser(),
      Prerequisites.validateOwnership()
    ],
    handler: filesController.update.bind(filesController),
    description: `Update a single file object based on \`id\`.`,
    validate: {
      payload: schema,
      params: {
        id: Joi.number().integer().required()
      },
      failAction: Errors.id
    }
  }
}];
