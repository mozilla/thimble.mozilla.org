'use strict';

exports.up = function (knex, Promise) {
  return Promise.resolve()
  .then(function() {
    return knex.schema.createTable('publishedProjects', function(t) {
      t.increments('id');
      t.text('title').notNullable();
      t.text('tags');
      t.text('description');
    });
  })
  .then(function() {
    return knex.schema.createTable('users', function (t) {
      t.increments('id');
      t.text('name').notNullable().unique();
    });
  })
  .then(function() {
    return knex.schema.createTable('projects', function (t) {
      t.increments('id');
      t.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
      t.integer('published_id').references('id').inTable('publishedProjects');
      t.text('title').notNullable();
      t.text('tags');
      t.text('description');
      t.text('publish_url');
      t.text('date_created').notNullable();
      t.text('date_updated').notNullable();
    });
  })
  .then(function() {
    return knex.schema.createTable('files', function (t) {
      t.increments('id');
      t.integer('project_id').notNullable().references('id').inTable('projects').onDelete('CASCADE');
      t.text('path').notNullable();
      t.specificType('buffer', 'bytea').notNullable();
    });
  })
  .then(function() {
    return knex.schema.createTable('publishedFiles', function(t) {
      t.increments('id');
      t.integer('published_id').notNullable().references('id').inTable('publishedProjects').onDelete('CASCADE');
      t.integer('file_id').references('id').inTable('files');
      t.text('path').notNullable();
      t.specificType('buffer', 'bytea').notNullable();
    });
  });
};


exports.down = function (knex, Promise) {
  // Irreversible, as this can lead to permanent data loss.
  return Promise.resolve();
};
