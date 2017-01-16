"use strict";

const fs = require(`fs`);

const BaseController = require(`../../classes/base_controller`);
const Errors = require(`../../classes/errors`);

const FilesModel = require(`./model`);

const PublishedFiles = require(`../publishedFiles/model`);

// We do not want to serialize the buffer and send it with the
// response for Create and Update requests so we strip it out
// of the response before it is sent.
function formatResponse(model) {
  model.unset(`buffer`);
  return model;
}

class FilesController extends BaseController {
  constructor() {
    super(FilesModel);
  }

  formatRequestData(request) {
    // We've already cached the path of the temporary file
    // in a prerequisite function
    const buffer = fs.readFileSync(request.pre.tmpFile);
    const data = {
      path: request.payload.path,
      project_id: request.payload.project_id,
      buffer: buffer
    };

    if (request.params.id) {
      data.id = parseInt(request.params.id);
    }

    return data;
  }

  create(request, reply) {
    return super.create(request, reply, formatResponse);
  }

  update(request, reply) {
    return super.update(request, reply, formatResponse);
  }

  delete(request, reply) {
    const record = request.pre.records.models[0];

    // If a published file exists for this file, we have
    // to unset it's reference before deletion can occur
    PublishedFiles.query({
      where: {
        file_id: record.get(`id`)
      }
    })
    .fetch()
    .then(function(model) {
      if (!model) {
        return;
      }

      return model
      .set({ file_id: null })
      .save();
    })
    .then(() => super.delete(request, reply))
    .catch(function(error) { reply(Errors.generateErrorResponse(error)); });
  }
}

module.exports = new FilesController();
