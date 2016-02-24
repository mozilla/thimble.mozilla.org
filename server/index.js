"use strict";

/**
 * Module dependencies.
 */
let express = require("express");
let path = require("path");
let favicon = require("serve-favicon");

let env = require("./lib/environment");
let templatize = require("./templatize");
let Request = require("./request");
let Security = require("./security");
let localize = require("./localize");
let errorhandling = require("./lib/errorhandling");
let middleware = require("./lib/middleware")();
let routes = require("./routes")();
let getFileList = require("./lib/utils").getFileList;

let server = express();
let isDevelopment = env.get("NODE_ENV") === "development";
let root = path.dirname(__dirname);
let client = path.join(root, isDevelopment ? "client" : "dist");
let cssAssets = path.join(require("os").tmpDir(), "mozilla.webmaker.org");
const maxCacheAge = { maxAge: "1d" };

/*
 * Local server variables
 */
server.locals.GA_ACCOUNT = env.get("GA_ACCOUNT");
server.locals.GA_DOMAIN = env.get("GA_DOMAIN");
server.locals.bower_path = "bower_components";


/**
 * Templating engine
 */
templatize(server, [ "views", "bower_components" ]);


/**
 * Request/Response configuration
 */
let requests = new Request(server);
requests.disableHeaders([ "x-powered-by" ])
.compress()
.json({ limit: "5MB" })
.url({ extended: true })
.lessOptimizations(path.join(root, "public"), cssAssets, !isDevelopment)
.healthcheck()
.sessions({
  key: "mozillaThimble",
  secret: env.get("SESSION_SECRET"),
  cookie: {
    expires: false,
    secure: env.get("FORCE_SSL")
  },
  proxy: true
});
// Logging
if(isDevelopment) {
  requests.log("dev");
}


/**
 * Thimble Favicon
 */
let faviconPath = path.join(root, "public/resources/img/favicon.png");
server.use(favicon(faviconPath));


/**
 * Server Security
 */
let secure = new Security(server);
secure.xss()
.mimeSniff()
.csrf()
.xframe()
.csp({
  frame: [ env.get("BRAMBLE_URI") ],
  script: [ env.get("BRAMBLE_URI") ]
});
if(!!env.get("FORCE_SSL")) {
  secure.ssl();
}


/**
 * Static assets
 */
getFileList(path.join(root, "public"), "!(*.js)")
.forEach(file => server.use(express.static(file, maxCacheAge)));
server.use(express.static(client, maxCacheAge));
server.use(express.static(cssAssets, maxCacheAge));
server.use(express.static(path.join(root, "public/resources"), maxCacheAge));
// So that we don't break compatibility with existing published projects,
// we serve the remix resources through this route as well
server.use("/resources/remix", express.static(path.join(root, "public/resources/remix"), maxCacheAge));
server.use("/bower", express.static(path.join(root, server.locals.bower_path), maxCacheAge));


/**
 * L10N
 */
localize(server, Object.assign(env.get("L10N"), {
   excludeLocaleInUrl: [ "/projects/remix-bar" ]
}));


/**
 * API routes
 */
routes.init(server, middleware);


/*
 * Error handlers
 */
server.use(errorhandling.errorHandler);
server.use(errorhandling.pageNotFoundHandler);

/*
 * Start the server
 */
server.listen(env.get("PORT"), function() {
  console.log("Express server listening on " + env.get("APP_HOSTNAME"));
});
