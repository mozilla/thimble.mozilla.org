"use strict";

const Promise = require(`bluebird`); // jshint ignore:line

const BaseController = require(`../../classes/base_controller`);
const Errors = require(`../../classes/errors`);

const ProjectsModel = require(`../projects/model`);
const FilesModel = require(`../files/model`);
const PublishedFilesModel = require(`../publishedFiles/model`);

const PublishedProjectsModel = require(`./model`);

const DateTracker = require(`../../../lib/utils`).DateTracker;

class Remix {
  constructor(publishedProjectModel, userModel) {
    this.publishedProjectsModel = publishedProjectModel;
    this.usersModel = userModel;
  }

  // Make sure we have the ` (remix)` suffix, adding if necessary,
  // but not re-adding to a title that already has it (remix of remix).
  ensureRemixSuffix(title) {
    return title.replace(/( \(remix\))*$/, ` (remix)`);
  }

  _createProjectRemix() {
    const now = (new Date()).toISOString();

    return ProjectsModel
    .forge({
      title: this.ensureRemixSuffix(this.publishedProjectsModel.get(`title`)),
      user_id: this.usersModel.get(`id`),
      tags: this.publishedProjectsModel.get(`tags`),
      description: this.publishedProjectsModel.description,
      date_created: now,
      date_updated: now
    })
    .save()
    .then(remixedProject => {
      this.remixedProject = remixedProject;
    });
  }

  _getFilesToRemix() {
    return PublishedFilesModel.query({
      where: {
        published_id: this.publishedProjectsModel.get(`id`)
      }
    })
    .fetchAll();
  }

  _createRemixFiles(filesToRemix) {
    return Promise.map(filesToRemix.models, publishedFilesModel => {
      return FilesModel
      .forge({
        path: publishedFilesModel.get(`path`),
        project_id: this.remixedProject.get(`id`),
        buffer: publishedFilesModel.get(`buffer`)
      })
      .save();
    });
  }

  save() {
    return this._createProjectRemix()
    .then(() => this._getFilesToRemix())
    .then(filesToRemix => this._createRemixFiles(filesToRemix))
    .then(() => this.remixedProject);
  }
}

class PublishedProjectsController extends BaseController {
  constructor() {
    super(PublishedProjectsModel);
  }

  formatResponseData(model) {
    return DateTracker.convertToISOStrings(model);
  }

  create(request, reply) {
    return super.create(request, reply, DateTracker.convertToISOStringsForModel);
  }

  update(request, reply) {
    return super.update(request, reply, DateTracker.convertToISOStringsForModel);
  }

  remix(request, reply) {
    const publishedProjectsModel = request.pre.records.models[0];
    const usersModel = request.pre.user;
    const remix = new Remix(publishedProjectsModel, usersModel);

    const result = remix
    .save()
    .then(DateTracker.convertToISOStringsForModel)
    .catch(Errors.generateErrorResponse);

    return reply(result);
  }
}

module.exports = new PublishedProjectsController();
