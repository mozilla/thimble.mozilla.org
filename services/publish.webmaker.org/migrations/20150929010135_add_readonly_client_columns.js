'use strict';

exports.up = function (knex, Promise) {
  return Promise.join(
    knex.schema.table('projects', function (t) {
      t.boolean('_readonly');
      t.text('_client');
    })
  );
};

exports.down = function (knex, Promise) {
  // Irreversible, as this can lead to permanent data loss.
  return Promise.resolve();
};
