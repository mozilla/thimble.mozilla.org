"use strict";

const create = require(`./routes/create`);
const read = require(`./routes/read`);
const update = require(`./routes/update`);
const del = require(`./routes/delete`);
const login = require(`./routes/login`);

const routes = [].concat(create, read, update, del, login);

exports.register = function(server, options, next) {
  server.route(routes);

  next();
};

exports.register.attributes = {
  name: `users`
};
