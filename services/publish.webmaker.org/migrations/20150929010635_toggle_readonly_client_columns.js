'use strict';

exports.up = function (knex, Promise) {
  // "Enable" the readonly and client columns.
  return Promise.join(
    knex.schema.table('projects', function (t) {
      t.renameColumn('_readonly', 'readonly');
      t.renameColumn('_client', 'client');
    })
  );
};

exports.down = function (knex, Promise) {
  // "Disable" the readonly and client columns.
  return Promise.join(
    knex.schema.table('projects', function (t) {
      t.renameColumn('readonly', '_readonly');
      t.renameColumn('client', '_client');
    })
  );
};
