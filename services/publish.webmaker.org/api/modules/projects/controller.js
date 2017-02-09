"use strict";

const Boom = require(`boom`);
const Promise = require(`bluebird`);

const Bookshelf = require(`../../classes/database`).Bookshelf;
const Errors = require(`../../classes/errors`);
const BaseController = require(`../../classes/base_controller`);
const Publisher = require(`../../classes/publisher`);

const FilesModel = require(`../files/model`);
const PublishedFilesModel = require(`../publishedFiles/model`);

const ProjectsModel = require(`./model`);

const DateTracker = require(`../../../lib/utils`).DateTracker;

class PublishedFilesCleanup {
  constructor(project) {
    this.project = project;
  }

  fetchPublishedFiles(fileModel) {
    return PublishedFilesModel.query({
      where: {
        file_id: fileModel.get(`id`)
      }
    })
    .fetchAll();
  }

  deletePublishedFiles(publishedFilesModels) {
    if (publishedFilesModels.length === 0) {
      return Promise.resolve();
    }

    return publishedFilesModels.mapThen(function(publishedFileModel) {
      return publishedFileModel.destroy();
    });
  }

  cleanup() {
    return FilesModel.query({
      where: {
        project_id: this.project.get(`id`)
      }
    })
    .fetchAll()
    .then(filesModels => {
      return filesModels.mapThen(fileModel =>
        this.fetchPublishedFiles(fileModel)
        .then(this.deletePublishedFiles)
      );
    });
  }
}

class ProjectsController extends BaseController {
  constructor() {
    super(ProjectsModel);
  }

  formatRequestData(request) {
    const payload = request.payload;
    const now = new Date();
    const data = {
      title: payload.title,
      user_id: payload.user_id,
      tags: payload.tags,
      description: payload.description,
      date_created: now,
      date_updated: now,
      readonly: payload.readonly,
      client: payload.client
    };

    // If it is an update request
    if (request.params.id) {
      data.id = parseInt(request.params.id);
      delete data.date_created;
    }

    return data;
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

  delete(request, reply) {
    const project = request.pre.records.models[0];
    const publisher = new Publisher(project);
    const publishedFilesCleanup = new PublishedFilesCleanup(project);

    // If this project is published, we have to
    // unpublish it before it can be safely deleted.
    // We then do a dummy check to make sure no old publishedFiles
    // exist for this. Horribly inefficent!
    // TODO: https://github.com/mozilla/publish.webmaker.org/issues/140
    return Promise.resolve().then(function() {
      if (project.get(`published_id`)) {
        return publisher.unpublish();
      }
    })
    .then(publishedFilesCleanup.cleanup.bind(publishedFilesCleanup))
    .then(() => super.delete(request, reply))
    .catch(function(error) {
      reply(Errors.generateErrorResponse(error));
    });
  }

  publish(request, reply) {
    const project = request.pre.records.models[0];
    const publisher = new Publisher(project);
    const readonly = request.query.readonly;

    const result = publisher
    .publish(readonly)
    .then(DateTracker.convertToISOStringsForModel)
    .then(function(publishedModel) {
      return request.generateResponse(publishedModel).code(200);
    })
    .catch(Errors.generateErrorResponse);

    return reply(result);
  }

  unpublish(request, reply) {
    const project = request.pre.records.models[0];
    const publisher = new Publisher(project);

    if (!project.attributes.publish_url) {
      return reply(Errors.generateErrorResponse(
        Boom.notFound(null, {
          debug: true,
          error: `This project was not published`
        })
      ));
    }

    const result = publisher
    .unpublish()
    .then(DateTracker.convertToISOStringsForModel)
    .then(function(unpublishedModel) {
      return request.generateResponse(unpublishedModel).code(200);
    })
    .catch(Errors.generateErrorResponse);

    return reply(result);
  }

  updatePaths(request, reply) {
    const projectId = request.pre.records.models[0].get(`id`);
    const renamedPaths = request.payload;

    function renameOperation(transaction) {
      return Promise.map(Object.keys(renamedPaths), function(oldPath) {
        return FilesModel.query({
          where: {
            path: oldPath,
            project_id: projectId
          }
        })
        .fetch({ transacting: transaction })
        .then(function(file) {
          if(!file) {
            // We ignore file paths that were not found
            // so that we do not fail the entire operation
            // because of one bad value
            return Promise.resolve();
          }

          file.set({ path: renamedPaths[oldPath] });

          return file.save(file.changed, {
            patch: true,
            method: `update`,
            transacting: transaction
          });
        });
      }, { concurrency: 3 });
    }

    const result = Bookshelf.transaction(renameOperation)
    .then(function() { return request.generateResponse().code(200); })
    .catch(Errors.generateErrorResponse);

    return reply(result);
  }
}

module.exports = new ProjectsController();
