'use strict';

exports.up = function(knex, Promise) {
  return Promise.join(
    knex.schema.table('projects', function(t) {
      t.dropColumn('date_created');
      t.dropColumn('date_updated');
    }),
    knex.schema.table('publishedProjects', function(t) {
      t.dropColumn('date_created');
      t.dropColumn('date_updated');
    })
  );
};

exports.down = function(knex, Promise) {
  // Irreversible, you cannot re-create the column with the original data
  return Promise.resolve();
};
