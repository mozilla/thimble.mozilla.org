'use strict';

exports.up = function (knex, Promise) {
  // "Enable" the date_created and date_updated columns.
  return Promise.join(
    knex.schema.table('publishedProjects', function (t) {
      t.renameColumn('_date_created', 'date_created');
      t.renameColumn('_date_updated', 'date_updated');
    })
  );
};

exports.down = function (knex, Promise) {
  // "Disable" the date_created and date_updated columns.
  return Promise.join(
    knex.schema.table('publishedProjects', function (t) {
      t.renameColumn('date_created', '_date_created');
      t.renameColumn('date_updated', '_date_updated');
    })
  );
};
