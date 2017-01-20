'use strict';

exports.up = function (knex, Promise) {
  return Promise.join(
    knex.schema.table('projects', function(t) {
      t.dateTime('_date_created');
      t.dateTime('_date_updated');
    }),
    knex.schema.table('publishedProjects', function(t) {
      t.dateTime('_date_created');
      t.dateTime('_date_updated');
    })
  );
};

exports.down = function (knex, Promise) {
  // Irreversible, as this can lead to permanent data loss.
  return Promise.resolve();
};
