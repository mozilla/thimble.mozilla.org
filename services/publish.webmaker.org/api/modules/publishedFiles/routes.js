"use strict";

const read = require(`./routes/read`);

const routes = [].concat(read);

exports.register = function(server, options, next) {
  server.route(routes);

  next();
};

exports.register.attributes = {
  name: `publishedFiles`
};
