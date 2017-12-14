"use strict";

let compression = require("compression");
let morgan = require("morgan");
let bodyParser = require("body-parser");
let cookieParser = require("cookie-parser");
let cookieSession = require("cookie-session");

let version = require("../package").version;
const Logger = require("./logger");

const logFormats = {
  production:
    "[request_id=:request-id] date=:date[clf] method=:method path=:url status=:status fwd=:fwd bytes=:res[content-length]",
  development:
    "method".cyan +
    "=:method " +
    "path".cyan +
    "=:url " +
    "status".cyan +
    "=:status " +
    "bytes".cyan +
    "=:res[content-length] " +
    "response_time".cyan +
    "=:response-time[0]"
};

morgan.token("request-id", function(request, response) {
  //jshint unused:vars
  return request.get("X-Request-Id");
});

morgan.token("fwd", function(request, response) {
  //jshint unused:vars
  return request.get("X-Forwarded-For");
});

morgan.token("status", function(request, response) {
  // Taken from morgan.js
  if (!response._header) {
    return "-";
  }

  const status = response.statusCode;
  const statusStr = status.toString();

  return status >= 500
    ? statusStr.red
    : status >= 400
      ? statusStr.yellow
      : status >= 300
        ? statusStr.blue
        : status >= 200 ? statusStr.green : status;
});

function Request(server) {
  this.server = server;
}

Request.prototype = {
  compress() {
    this.server.use(compression());
    return this;
  },
  disableHeaders(headers) {
    headers.forEach(header => this.server.disable(header));
    return this;
  },
  enableLogging(environment, level) {
    const format = logFormats[environment] || logFormats.development;

    this.server.use(morgan(format));
    this.server.use(function(request, response, next) {
      request.log = new Logger(request, environment, level);
      next();
    });

    return this;
  },
  json(options) {
    this.server.use(bodyParser.json(options));
    return this;
  },
  url(options) {
    this.server.use(bodyParser.urlencoded(options));
    return this;
  },
  sessions(cookieOptions) {
    this.server.use(cookieParser());

    // This is a work-around for cross-origin OPTIONS requests
    // See https://github.com/senchalabs/connect/issues/323
    let session = cookieSession(cookieOptions);
    this.server.use((req, res, next) => {
      if (req.method.toLowerCase() === "options") {
        next();
      } else {
        session(req, res, next);
      }
    });

    return this;
  },
  healthcheck() {
    this.server.get("/healthcheck", (req, res) => {
      res.json({ http: "okay", version: version });
    });

    return this;
  }
};

module.exports = Request;
