"use strict";

const BaseModel = require(`../../classes/base_model`);

const FilesModel = require(`../files/model`);

class PublishedFilesQueryBuilder {
  constructor(context, filesTable) {
    this.context = context;
    this.filesTable = filesTable;
    this.PublishedFilesModel = context.constructor;
  }

  getOne(id) {
    return new this.PublishedFilesModel()
    .query()
    .where(this.context.column(`id`), id)
    .then(function(publishedFiles) { return publishedFiles[0]; });
  }

  getAllNewFiles(projectId) {
    return new FilesModel()
    .query()
    .leftOuterJoin(
      this.context.tableName,
      this.filesTable.column(`id`),
      this.context.column(`file_id`)
    )
    .where(this.filesTable.column(`project_id`), projectId)
    .whereNull(this.context.column(`file_id`))
    .select(
      this.filesTable.column(`id`),
      this.filesTable.column(`path`),
      this.filesTable.column(`buffer`)
    );
  }

  getAllModifiedFiles(publishedId) {
    const self = this;

    return new this.PublishedFilesModel()
    .query()
    .innerJoin(
      this.filesTable.tableName,
      this.context.column(`file_id`),
      this.filesTable.column(`id`)
    )
    .where(this.context.column(`published_id`), publishedId)
    .where(function() {
      this.whereRaw(
        self.context.column(`path`, null, true) +
        ` <> ` +
        self.filesTable.column(`path`, null, true) +
        ` OR ` +
        self.context.column(`buffer`, null, true) +
        ` <> ` +
        self.filesTable.column(`buffer`, null, true)
      );
    })
    .select(
      this.context.column(`id`),
      this.context.column(`path`, `oldPath`),
      this.filesTable.column(`path`),
      this.filesTable.column(`buffer`)
    );
  }

  getAllDeletedFiles(publishedId) {
    return new this.PublishedFilesModel()
    .query()
    .where(this.context.column(`published_id`), publishedId)
    .whereNull(this.context.column(`file_id`))
    .select(
      this.context.column(`id`),
      this.context.column(`path`)
    );
  }

  getAllPaths(publishedId) {
    return new this.PublishedFilesModel()
    .query()
    .where(this.context.column(`published_id`), publishedId)
    .select(this.context.column(`path`))
    .then(function(publishedFiles) {
      // Return an array of paths vs. an array of objects containing
      // only paths
      return publishedFiles.map(function(publishedFile) {
        return publishedFile.path;
      });
    });
  }

  createOne(publishedFileData) {
    return new this.PublishedFilesModel()
    .query()
    .insert(publishedFileData, `id`)
    .then(function(ids) { return ids[0]; });
  }

  updateOne(id, updatedValues) {
    return new this.PublishedFilesModel()
    .query()
    .where(this.context.column(`id`), id)
    .update(updatedValues)
    .then(function() { return id; });
  }

  deleteOne(id) {
    return new this.PublishedFilesModel()
    .query()
    .where(this.context.column(`id`), id)
    .del();
  }

  deleteAll(publishedId) {
    return new this.PublishedFilesModel()
    .query()
    .where(this.context.column(`published_id`), publishedId)
    .del();
  }
}

const instanceProps = {
  tableName: `publishedFiles`,
  project() {
    return this.belongsTo(require(`../publishedProjects/model`));
  },
  queryBuilder() {
    return new PublishedFilesQueryBuilder(this, FilesModel.prototype);
  }
};

const classProps = {
  typeName: `publishedFiles`,
  filters: {
    project_id(queryBuilder, value) {
      return queryBuilder.whereIn(`project_id`, value);
    }
  },
  relations: [
    `publishedProject`
  ]
};

module.exports = BaseModel.extend(instanceProps, classProps);
