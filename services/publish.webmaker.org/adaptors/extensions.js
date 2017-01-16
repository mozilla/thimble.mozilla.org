"use strict";

const fs = require(`fs`);

exports.clearTemporaryFile = function(request, reply) {
  if (request.response.isBoom) {
    return reply.continue();
  }

  // Once a successful request completes, we delete any
  // temporary files we created
  request.response.once(`finish`, function() {
    if (!request.app.tmpFile) {
      return;
    }

    fs.unlink(request.app.tmpFile, function(err) {
      if (err) {
        request.log.error(`Failed to destroy temporary file with ${err}`);
      }
    });
  });

  reply.continue();
};

exports.logRequest = function(request, reply) {
  const response = request.response;

  // We don't want to clutter the terminal, so only
  // show request details if this was an error
  if (!response.isBoom) {
    reply.continue();
    return;
  }

  const data = response.data;
  const error = data && data.error;

  // Prefer the error object stack over the
  // boom object stack
  const stack = error && error.stack || response.stack;

  let logLevel = `error`;

  if (!data || data.debug) {
    // Errors we process will contain a "data" property
    // containing the error object (or string) and the
    // level of the error. If it doesn't exist, then the `boom`
    // object was created by the framework and represents an
    // error we don't care about under normal circumstances
    logLevel = `debug`;
  }

  request.log[logLevel]({
    request,
    response,
    error,
    stack
  });

  reply.continue();
};
