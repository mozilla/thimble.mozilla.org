"use strict";

const BaseModel = require(`../../classes/base_model`);

const ProjectsModel = require(`../projects/model`);

const instanceProps = {
  tableName: `files`,
  project() {
    return this.belongsTo(ProjectsModel);
  },
  user() {
    // We require in the function as opposed to adding a top-level require
    // to resolve the circular dependencies between models
    return this.belongsTo(require(`../users/model`)).through(ProjectsModel);
  }
};

const classProps = {
  typeName: `files`,
  filters: {
    project_id(qb, value) {
      return qb.whereIn(`project_id`, value);
    }
  },
  relations: [
    `project`,
    `user`
  ]
};

module.exports = BaseModel.extend(instanceProps, classProps);
