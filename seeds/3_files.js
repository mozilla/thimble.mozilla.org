'use strict';

var fs = require('fs');

exports.seed = function(knex, Promise) {
  return Promise.join(
    knex('files').insert({
      project_id: 1,
      path: '/spacecats-API/index.js',
      buffer: fs.readFileSync(__dirname + '/file_data/index.js')
    }),
    knex('files').insert({
      project_id: 1,
      path: '/spacecats-API/package.json',
      buffer: fs.readFileSync(__dirname + '/file_data/package.json')
    }),
    knex('files').insert({
      project_id: 1,
      path: '/spacecats-API/index.html',
      buffer: fs.readFileSync(__dirname + '/file_data/index.html')
    }),
    knex('files').insert({
      project_id: 1,
      path: '/spacecats-API/public/img/sagan.jpg',
      buffer: fs.readFileSync(__dirname + '/file_data/public/img/sagan.jpg')
    }),
    knex('files').insert({
      project_id: 2,
      path: '/sinatra-contrib/Gemfile',
      buffer: fs.readFileSync(__dirname + '/file_data/Gemfile')
    }),
    knex('files').insert({
      project_id: 2,
      path: '/sinatra-contrib/main.html',
      buffer: fs.readFileSync(__dirname + '/file_data/main.html')
    }),
    knex('files').insert({
      project_id: 3,
      path: '/webmaker-android/logo.png',
      buffer: fs.readFileSync(__dirname + '/file_data/logo.png')
    }),
    knex('files').insert({
      project_id: 4,
      path: '/makedrive/.gitignore',
      buffer: fs.readFileSync(__dirname + '/file_data/.gitignore')
    })
  );
};
