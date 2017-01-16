"use strict";

const Boom = require(`boom`);

function generateBadRequest(param, isMissingError) {
  const messageSuffix = isMissingError ? `must be passed.` : `invalid`;
  const error = `${param} ${messageSuffix}`;

  return Boom.badRequest(error, {
    debug: true,
    error
  });
}

class Errors {
  static attrs(request, reply, source, error) {
    const errorDetails = error.data.details[0];
    const failedAttribute = `\`${errorDetails.path}\``;

    // Look to see if the attribute was passed at all
    if (errorDetails.message.indexOf(`is required`) !== -1) {
      return reply(generateBadRequest(failedAttribute, true));
    }

    // Otherwise the type was invalid
    return reply(generateBadRequest(failedAttribute));
  }

  /* eslint no-unused-vars: ["error", { "argsIgnorePattern": "^error$" }]*/
  static id(request, reply, source, error) {
    return reply(generateBadRequest(`\`id\``));
  }

  /* eslint no-unused-vars: ["error", { "argsIgnorePattern": "^error$" }]*/
  static name(request, reply, source, error) {
    return reply(generateBadRequest(`\`name\``));
  }

  static generateErrorResponse(error) {
    if (error.isBoom) {
      return error;
    }

    return Boom.badImplementation(null, { error });
  }
}

module.exports = Errors;
