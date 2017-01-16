"use strict";

const create = require(`./routes/create.js`);
const read = require(`./routes/read.js`);
const update = require(`./routes/update.js`);
const del = require(`./routes/delete.js`);

const routes = [].concat(create, read, update, del);

exports.register = function(server, options, next) {
  server.route(routes);

  next();
};

exports.register.attributes = {
  name: `files`
};
