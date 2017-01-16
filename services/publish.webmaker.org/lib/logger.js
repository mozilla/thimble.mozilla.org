"use strict";

/*
 * Wrapper for logging server messages at different log levels
*/

const Hoek = require(`hoek`);
const bunyan = require(`bunyan`);
const PrettyStream = require(`bunyan-prettystream`);

Hoek.assert(process.env.LOG_LEVEL, `Must define LOG_LEVEL`);

const stream = new PrettyStream();

stream.pipe(process.stdout);

class Serializers {
  static requestSerializer(request) {
    return {
      path: request.path,
      method: request.method,
      headers: request.headers
    };
  }

  static responseSerializer(response) {
    return {
      payload: response.output.payload
    };
  }

  static errorSerializer(error) {
    if (!error) {
      return;
    }

    if (typeof error === `string`) {
      return { message: error };
    }

    // The `message` property of an Error object isn't enumerable,
    // so we clone the object and attach it to make sure it's logged
    const serializedData = JSON.parse(JSON.stringify(error));

    serializedData.message = error.message;

    return serializedData;
  }
}

module.exports = bunyan.createLogger({
  name: `publish.webmaker.org`,
  level: process.env.LOG_LEVEL,
  serializers: {
    request: Serializers.requestSerializer,
    response: Serializers.responseSerializer,
    error: Serializers.errorSerializer
  },
  stream
});
