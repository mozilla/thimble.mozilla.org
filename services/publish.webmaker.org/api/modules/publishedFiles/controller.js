"use strict";

const BaseController = require(`../../classes/base_controller`);

const PublishedFilesModel = require(`./model`);

class PublishedFilesController extends BaseController {
  constructor() {
    super(PublishedFilesModel);
  }

  formatResponseData(model) {
    delete model.file_id;
    return model;
  }
}

module.exports = new PublishedFilesController();
