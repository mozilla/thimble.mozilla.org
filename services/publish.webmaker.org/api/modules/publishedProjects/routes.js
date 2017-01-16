"use strict";

const read = require(`./routes/read`);
const remix = require(`./routes/remix`);

const routes = [].concat(read, remix);

exports.register = function(server, options, next) {
  server.route(routes);

  next();
};

exports.register.attributes = {
  name: `publishedProjects`
};
