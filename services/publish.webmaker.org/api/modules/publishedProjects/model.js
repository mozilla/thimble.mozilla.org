"use strict";

const BaseModel = require(`../../classes/base_model`);

const ProjectsModel = require(`../projects/model`);

const DateTracker = require(`../../../lib/utils`).DateTracker;

class PublishedProjectsQueryBuilder {
  constructor(context) {
    this.context = context;
    this.PublishedProjectsModel = context.constructor;
  }

  getOne(id) {
    return new this.PublishedProjectsModel()
    .query()
    .where(this.context.column(`id`), id)
    .then(publishedProjects => this.context.parse(publishedProjects[0]));
  }

  createOne(data) {
    return new this.PublishedProjectsModel()
    .query()
    .insert(this.context.format(data), `id`)
    .then(function(ids) { return ids[0]; });
  }

  updateOne(id, updatedValues) {
    return new this.PublishedProjectsModel()
    .query()
    .where(this.context.column(`id`), id)
    .update(this.context.format(updatedValues))
    .then(function() { return id; });
  }

  deleteOne(id) {
    return new this.PublishedProjectsModel()
    .query()
    .where(this.context.column(`id`), id)
    .del();
  }
}

const instanceProps = {
  tableName: `publishedProjects`,
  project() {
    return this.belongsTo(ProjectsModel);
  },
  user() {
    return this.belongsTo(require(`../users/model`)).through(ProjectsModel);
  },
  publishedFiles() {
    return this.hasMany(require(`../publishedFiles/model`));
  },
  format: DateTracker.formatDatesInModel,
  parse: DateTracker.parseDatesInModel,
  queryBuilder() {
    return new PublishedProjectsQueryBuilder(this);
  }
};

const classProps = {
  typeName: `publishedProjects`,
  filters: {
    project_id(queryBuilder, value) {
      return queryBuilder.whereIn(`project_id`, value);
    }
  },
  relations: [
    `publishedFiles`,
    `user`
  ]
};

module.exports = BaseModel.extend(instanceProps, classProps);
