"use strict";

let compression = require("compression");
let logger = require("morgan");
let bodyParser = require("body-parser");
let cookieParser = require("cookie-parser");
let cookieSession = require("cookie-session");
let lessMiddleWare = require("less-middleware");
let version = require("../package").version;

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
  log(mode) {
    this.server.use(logger(mode));
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
      if(req.method.toLowerCase() === "options") {
        next();
      } else {
        session(req, res, next);
      }
    });

    return this;
  },
  lessOptimizations(src, dest, optimize) {
    this.server.use(lessMiddleWare(src, {
      once: optimize,
      debug: !optimize,
      dest,
      compress: true,
      yuicompress: optimize,
      optimization: optimize ? 0 : 2
    }));

    return this;
  },
  healthcheck() {
    this.server.get("/healthcheck", (req, res) => {
      res.json({ http: 'okay', version: version });
    });

    return this;
  }
};

module.exports = Request;
