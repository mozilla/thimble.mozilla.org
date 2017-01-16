"use strict";

const BaseModel = require(`../../classes/base_model`);

class UsersQueryBuilder {
  constructor(context) {
    this.context = context;
    this.UsersModel = context.constructor;
  }

  getOne(id) {
    return new this.UsersModel()
    .query()
    .where(this.context.column(`id`), id)
    .then(function(users) { return users[0]; });
  }
}

const instanceProps = {
  tableName: `users`,
  projects() {
    return this.hasMany(require(`../projects/model`));
  },
  queryBuilder() {
    return new UsersQueryBuilder(this);
  }
};

const classProps = {
  typeName: `comics`,
  filters: {
    name(queryBuilder, value) {
      return queryBuilder.whereIn(`name`, value);
    }
  },
  relations: [
    `projects`
  ]
};

module.exports = BaseModel.extend(instanceProps, classProps);
