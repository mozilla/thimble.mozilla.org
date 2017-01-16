'use strict';

exports.up = function (knex, Promise) {
  return Promise.join(
    knex.schema.table('publishedProjects', function (t) {
      t.text('_date_created');
      t.text('_date_updated');
    })
  );
};

exports.down = function (knex, Promise) {
  // Irreversible, as this can lead to permanent data loss.
  return Promise.resolve();
};
