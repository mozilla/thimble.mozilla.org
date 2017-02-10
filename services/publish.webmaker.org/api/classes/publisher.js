"use strict";

const Promise = require(`bluebird`);
const mime = require(`mime`);
const Path = require(`path`);

const s3Client = require(`../../lib/s3-client`).connect();

const log = require(`../../lib/logger.js`);
const Remix = require(`../../lib/remix`);

const Projects = require(`../modules/projects/model`);
const PublishedProjects = require(`../modules/publishedProjects/model`);

// SQL Query Generators
const usersQueryBuilder = require(`../modules/users/model`).prototype.queryBuilder();
const projectsQueryBuilder = Projects.prototype.queryBuilder();
const publishedProjectsQueryBuilder = PublishedProjects.prototype.queryBuilder();
const publishedFilesQueryBuilder = require(`../modules/publishedFiles/model`).prototype.queryBuilder();

const ROOT_URL = `/`;

/*
 * Utility functions
 */
function success(type, username) {
  return function(message) {
    log.info(`Publish for ${username} - [${type}] ${message}`);
  };
}

function failure(type, username) {
  return function(error) {
    log.error({ error }, `Publish for ${username} - [${type}]`);
    return Promise.reject(error);
  };
}

function getUploadRoot(publishClient, user, project) {
  if (!user || !project) {
    return null;
  }

  let httpPrefix = ``;
  const httpClients = (process.env.HTTP_CLIENTS || ``).split(`,`);

  // If the project's publishing client matches to a list
  // of "can publish http://" clients, prefix the upload root
  // /with a special "HTTP" namespace.
  if (publishClient && httpClients.indexOf(publishClient) !== -1) {
    httpPrefix = `/HTTP`;
  }

  return `${httpPrefix}/${user.name}/${project.id}`;
}

function buildUrl(publishClient, user, project) {
  if (!user || !project) {
    return null;
  }

  return process.env.PUBLIC_PROJECT_ENDPOINT + getUploadRoot(publishClient, user, project);
}

// Takes an absolute path and uri-encodes each component
// of the path to return a fully uri safe path
function uriSafe(path) {
  if (path === ROOT_URL) {
    return ROOT_URL;
  }

  let uriSafePath = ``;

  while(path !== ROOT_URL) {
    uriSafePath = Path.join(
      ROOT_URL,
      encodeURIComponent(Path.basename(path)),
      uriSafePath
    );
    path = Path.dirname(path);
  }

  return uriSafePath;
}


/*
 * Remote communication helpers
 */
function upload(path, buffer, remixMetadata) {
  const mimeType = mime.lookup(path);

  if (mimeType === `text/html` && !remixMetadata.readonly) {
    buffer = new Buffer(Remix.inject(buffer.toString(), remixMetadata));
  }

  const headers = {
    'Cache-Control': `max-age=0`,
    'Content-Type': `${mimeType}; charset=utf-8`,
    'Content-Length': buffer.length
  };

  const request = s3Client.put(uriSafe(path), headers);

  return new Promise(function(resolve, reject) {
    request.on(`error`, reject);

    request.on(`continue`, function() { request.end(buffer); });

    request.on(`response`, function(response) {
      if (response.statusCode === 200) {
        resolve(`Uploaded "${path}"`);
      } else {
        reject(`S3 upload returned ${response.statusCode}`);
      }
    });
  });
}

function remove(path) {
  return new Promise(function(resolve, reject) {
    const request = s3Client.del(uriSafe(path));

    request.on(`error`, reject);

    request.on(`response`, function(response) {
      if (response.statusCode === 204) {
        resolve(`Deleted "${path}"`);
      } else {
        reject(`S3 delete returned ${response.statusCode}`);
      }
    });

    request.end();
  });
}


class BasePublisher {
  /**
  * Record fetching helpers
  */

  fetchProjectModel(id) {
    // We do not use the `projectsQueryBuilder` interface here since we only want
    // a Bookshelf model to be returned. The `projectsQueryBuilder` interface returns
    // plain javascript objects. This method is primarily used when we want to
    // output the same form of data that was sent as an input viz. a Bookshelf
    // model.
    return Projects.query({
      where: { id }
    })
    .fetch();
  }

  fetchUserForProject() {
    return usersQueryBuilder
    .getOne(this.project.user_id)
    .then(user => {
      this.user = user;

      return user;
    });
  }

  fetchPublishedProject() {
    return publishedProjectsQueryBuilder
    .getOne(this.project.published_id)
    .then(publishedProject => {
      this.publishedProject = publishedProject;
      this.publishRoot = getUploadRoot(
        this.project.client,
        this.user,
        publishedProject
      );

      return publishedProject;
    });
  }


  /**
  * Record update helpers
  */

  updateProjectDetails() {
    const publishedProject = this.publishedProject;

    return projectsQueryBuilder
    .updateOne(this.project.id, {
      publish_url: buildUrl(
        this.project.client,
        this.user,
        publishedProject
      ),
      published_id: publishedProject && publishedProject.id
    })
    .then(id => projectsQueryBuilder.getOne(id))
    .then(project => {
      this.project = project;
    });
  }

  updateProjectReadOnlyProperty(readonly) {
    if (typeof readonly !== `boolean`) {
      return Promise.resolve();
    }

    return projectsQueryBuilder
    .updateOne(this.project.id, { readonly })
    .then(() => {
      this.project.readonly = readonly;
    });
  }

  setRemixDataForPublishedProject() {
    this.remixData = {
      projectId: this.publishedProject.id,
      projectTitle: this.publishedProject.title,
      projectAuthor: this.user.name,
      dateUpdated: this.publishedProject.date_updated.toISOString(),
      host: Remix.resourceHost,
      readonly: this.project.readonly
    };
  }

  createOrUpdatePublishedProject() {
    const project = this.project;
    const projectData = {
      title: project.title,
      tags: project.tags,
      description: project.description,
      date_updated: (new Date()).toISOString()
    };

    return this.fetchPublishedProject()
    .then(function(publishedProject) {
      if (publishedProject) {
        return publishedProjectsQueryBuilder.updateOne(publishedProject.id, projectData);
      } else {
        projectData.date_created = projectData.date_updated;
        return publishedProjectsQueryBuilder.createOne(projectData);
      }
    })
    .then(id => publishedProjectsQueryBuilder.getOne(id))
    .then(publishedProject => {
      this.publishedProject = publishedProject;
      this.publishRoot = getUploadRoot(
        this.project.client,
        this.user,
        publishedProject
      );
    });
  }


  /**
  * Remote record update helpers
  */

  uploadNewFiles() {
    return publishedFilesQueryBuilder
    .getAllNewFiles(this.project.id)
    .then(files => {
      if (!files.length) {
        return;
      }

      return Promise.map(files, file => {
        return publishedFilesQueryBuilder.createOne({
          file_id: file.id,
          published_id: this.publishedProject.id,
          path: file.path,
          buffer: file.buffer
        })
        .then(() => upload(
          `${this.publishRoot}${file.path}`,
          file.buffer,
          this.remixData
        ))
        .then(success(`CREATE`, this.user.name))
        .catch(failure(`CREATE`, this.user.name));
      });
    });
  }

  uploadModifiedFiles() {
    const remixData = this.remixData;
    const fileRoot = this.publishRoot;
    const username = this.user.name;

    function updateModelAndUpload(publishedFile) {
      const id = publishedFile.id;

      delete publishedFile.id;

      return publishedFilesQueryBuilder
      .updateOne(id, publishedFile)
      .then(function() {
        return upload(
          `${fileRoot}${publishedFile.path}`,
          publishedFile.buffer,
          remixData
        );
      })
      .then(success(`UPDATE`, username))
      .catch(failure(`UPDATE`, username));
    }

    return publishedFilesQueryBuilder
    .getAllModifiedFiles(this.publishedProject.id)
    .then(function(publishedFiles) {
      if (!publishedFiles.length) {
        return;
      }

      return Promise.map(publishedFiles, function(publishedFile) {
        const oldPath = publishedFile.oldPath;

        delete publishedFile.oldPath;

        if (oldPath === publishedFile.path) {
          return updateModelAndUpload(publishedFile);
        }

        return remove(fileRoot + oldPath)
        .then(function() { return updateModelAndUpload(publishedFile); });
      });
    });
  }


  /*
  * Record deletion helpers
  */
  deletePublishedProject() {
    const publishedProjectId = this.publishedProject.id;

    this.publishUrl = this.project.publish_url;
    this.publishedProject = null;

    return this.updateProjectDetails()
    .then(function() {
      return publishedProjectsQueryBuilder.deleteOne(publishedProjectId);
    });
  }

  deletePublishedFiles() {
    return publishedFilesQueryBuilder
    .getAllPaths(this.publishedProject.id)
    .then(publishedFilePaths => {
      return Promise.map(publishedFilePaths, publishedFilePath => {
        return remove(this.publishRoot + publishedFilePath)
        .then(success(`DELETE`, this.user.name))
        .catch(failure(`DELETE`, this.user.name));
      });
    })
    .then(() => publishedFilesQueryBuilder.deleteAll(this.publishedProject.id));
  }

  deleteOldFiles() {
    return publishedFilesQueryBuilder
    .getAllDeletedFiles(this.publishedProject.id)
    .then(publishedFiles => {
      if (!publishedFiles.length) {
        return;
      }

      return Promise.map(publishedFiles, publishedFile => {
        return publishedFilesQueryBuilder
        .deleteOne(publishedFile.id)
        .then(() => remove(this.publishRoot + publishedFile.path))
        .then(success(`DELETE`, this.user.name))
        .catch(failure(`DELETE`, this.user.name));
      });
    });
  }
}

class Publisher extends BasePublisher {
  constructor(project) {
    super();
    this.project = project.toJSON();
  }

  publish(readonly) {
    return Promise.resolve()
    .then(() => this.fetchUserForProject())
    .then(() => this.updateProjectReadOnlyProperty(readonly))
    .then(() => this.createOrUpdatePublishedProject())
    .then(() => this.setRemixDataForPublishedProject())
    .then(() => this.uploadNewFiles())
    .then(() => this.uploadModifiedFiles())
    .then(() => this.deleteOldFiles())
    .then(() => this.updateProjectDetails())
    .then(() => {
      log.info(
        `Publish for ${this.user.name} -`,
        `[PUBLISH] Published "${this.project.title}" to ${this.project.publish_url}`
      );

      return this.project.id;
    })
    .then(id => this.fetchProjectModel(id))
    .catch(Promise.reject);
  }

  unpublish() {
    return Promise.resolve()
    .then(() => this.fetchUserForProject())
    .then(() => this.fetchPublishedProject())
    .then(() => this.deletePublishedFiles())
    .then(() => this.deletePublishedProject())
    .then(() => {
      log.info(
        `Publish for ${this.user.name} -`,
        `[UNPUBLISH] Unpublished "${this.project.title}" from ${this.publishUrl}`
      );

      return this.project.id;
    })
    .then(id => this.fetchProjectModel(id))
    .catch(Promise.reject);
  }
}

module.exports = Publisher;
