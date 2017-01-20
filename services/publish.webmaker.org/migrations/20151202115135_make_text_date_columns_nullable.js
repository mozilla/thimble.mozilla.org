'use strict';

exports.up = function(knex, Promise) {
  return Promise.join(
    knex.raw('ALTER TABLE projects ALTER date_created DROP NOT NULL'),
    knex.raw('ALTER TABLE projects ALTER date_updated DROP NOT NULL'),

    knex.raw('ALTER TABLE \"publishedProjects\" ALTER date_created DROP NOT NULL'),
    knex.raw('ALTER TABLE \"publishedProjects\" ALTER date_updated DROP NOT NULL')
  );
};

exports.down = function (knex, Promise) {
  // Irreversible, as this can lead to permanent data loss.
  return Promise.resolve();
};
