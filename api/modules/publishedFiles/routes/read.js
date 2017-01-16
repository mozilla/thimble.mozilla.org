"use strict";

const Joi = require(`joi`);

const Errors = require(`../../../classes/errors`);
const Prerequisites = require(`../../../classes/prerequisites`);

const PublishedFilesModel = require(`../model`);
const publishedFilesController = require(`../controller`);

module.exports = [{
  method: `GET`,
  path: `/publishedFiles/{id}`,
  config: {
    auth: false,
    pre: [
      Prerequisites.confirmRecordExists(PublishedFilesModel, {
        mode: `param`,
        requestKey: `id`
      })
    ],
    handler: publishedFilesController.getOne.bind(publishedFilesController),
    description: `Retrieve a single published file object based on \`id\`.`,
    validate: {
      params: {
        id: Joi.number().integer().required()
      },
      failAction: Errors.id
    }
  }
}, {
  method: `GET`,
  path: `/publishedProjects/{published_id}/publishedFiles`,
  config: {
    auth: false,
    pre: [
      Prerequisites.confirmRecordExists(PublishedFilesModel, {
        mode: `param`,
        requestKey: `published_id`
      })
    ],
    handler: publishedFilesController.getAll.bind(publishedFilesController),
    description: `Retrieve a collection of published file objects that belong to a single published project object, ` +
    `based on \`published_id\`.`,
    validate: {
      params: {
        published_id: Joi.number().integer().required()
      },
      failAction: Errors.id
    }
  }
}, {
  method: `GET`,
  path: `/publishedProjects/{published_id}/publishedFiles/meta`,
  config: {
    auth: false,
    pre: [
      Prerequisites.confirmRecordExists(PublishedFilesModel, {
        mode: `param`,
        requestKey: `published_id`,
        columns: [`id`, `published_id`, `file_id`, `path`]
      })
    ],
    handler: publishedFilesController.getAllAsMeta.bind(publishedFilesController),
    description: `Retrieve a collection of publishedFile objects that belong to a single project object, based on ` +
    `\`published_id\`. Omits \`buffer\` attribute.`,
    validate: {
      params: {
        published_id: Joi.number().integer().required()
      },
      failAction: Errors.id
    }
  }
}, {
  method: `GET`,
  path: `/publishedProjects/{published_id}/publishedFiles/tar`,
  config: {
    auth: false,
    pre: [
      Prerequisites.confirmRecordExists(PublishedFilesModel, {
        mode: `param`,
        requestKey: `published_id`,
        columns: [`id`, `path`]
      })
    ],
    handler: publishedFilesController.getAllAsTar.bind(publishedFilesController),
    description: `Retrieve a collection of publishedFile objects that belong to a single project object, based on ` +
    `\`published_id\`. Omits \`buffer\` attribute.`,
    validate: {
      params: {
        published_id: Joi.number().integer().required()
      },
      failAction: Errors.id
    }
  }
}];
