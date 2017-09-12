"use strict";

/**
 * Module dependencies.
 */
let express = require("express");
let path = require("path");
let favicon = require("serve-favicon");
let url = require("url");

let env = require("./lib/environment");
let templatize = require("./templatize");
let Request = require("./request");
let Security = require("./security");
let localize = require("./localize");
let HttpError = require("./lib/http-error.js");
let routes = require("./routes")();

let server = express();
let environment = env.get("NODE_ENV");
let root = path.dirname(__dirname);
let client = path.join(root, "dist");
let editor = url.parse(env.get("BRAMBLE_URI"));
let editorHost = `${editor.protocol}//${editor.host}`;
let maxCacheAge = { maxAge: "1d" };
let maxAge1Week = 7 * 24 * 3600000;
let homepageVideoLink = "https://www.youtube.com/embed/JecFOjD9I3k";

/*
 * Local server variables
 */
server.locals.APP_HOSTNAME = env.get("APP_HOSTNAME");
server.locals.GA_ACCOUNT = env.get("GA_ACCOUNT");
server.locals.GA_DOMAIN = env.get("GA_DOMAIN");
server.locals.node_path = "node_modules";

/**
 * Templating engine
 */
templatize(server, ["views"]);

/**
 * Request/Response configuration
 */
let requests = new Request(server);
requests
  .disableHeaders(["x-powered-by"])
  .compress()
  .json({ limit: "5MB" })
  .url({ extended: true })
  .healthcheck()
  .sessions({
    key: "mozillaThimble",
    secret: env.get("SESSION_SECRET"),
    maxAge: maxAge1Week,
    cookie: {
      secure: env.get("FORCE_SSL")
    },
    proxy: true
  });

/**
 * Thimble Favicon
 */
let faviconPath = path.join(root, "public/resources/img/favicon.png");
server.use(favicon(faviconPath));

/**
 * Server Security
 */
let secure = new Security(server);
secure
  .xss()
  .mimeSniff()
  .csrf()
  .xframe()
  .csp({
    defaultSrc: [editorHost],
    frameSrc: [editorHost, homepageVideoLink],
    childSrc: [editorHost, homepageVideoLink],
    scriptSrc: [editorHost],
    connectSrc: [editorHost]
  });
if (!!env.get("FORCE_SSL")) {
  secure.ssl();
}

requests.enableLogging(environment);

/**
 * Static assets
 */
server.use(express.static(client, maxCacheAge));
server.use(express.static(path.join(root, "public/resources"), maxCacheAge));
server.use(
  "/node_modules",
  express.static(path.join(root, server.locals.node_path), maxCacheAge)
);
// So that we don't break compatibility with existing published projects,
// we serve the remix resources through this route as well
server.use(
  "/resources/remix",
  express.static(path.join(root, "public/resources/remix"), maxCacheAge)
);

/**
 * L10N
 */
localize(
  server,
  Object.assign(env.get("L10N"), {
    excludeLocaleInUrl: ["/projects/remix-bar"]
  })
);

/**
 * API routes
 */
routes.init(server);

/*
 * Error handlers
 */
server.use(HttpError.generic);
server.use(HttpError.notFound);

/*
 * export the server object
 */
module.exports = server;
