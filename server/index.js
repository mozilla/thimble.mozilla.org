"use strict";

// TODO: Here we're going to declare the "passport" dependency, pass it into the request.js file
// and also initialize the passport.js module file which is going to initialize our strategies.

/**
 * Module dependencies.
 */
let express = require("express");
let path = require("path");
let favicon = require("serve-favicon");
let url = require("url");
let passport = require("passport");

let env = require("./lib/environment");
let templatize = require("./templatize");
let Request = require("./request");
let Security = require("./security");
let localize = require("./localize");
let HttpError = require("./lib/http-error.js");
let routes = require("./routes")();
let Utils = require("./lib/utils");
let passportConfig = require("./passport");

let server = express();
let environment = env.get("NODE_ENV");
let isDevelopment = environment === "development";
let root = path.dirname(__dirname);
let client = path.join(root, isDevelopment ? "client" : "dist");
let cssAssets = path.join(require("os").tmpDir(), "mozilla.webmaker.org");
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
templatize(server, [ "views" ]);

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
.passport(passport)
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
secure.xss()
.mimeSniff()
.csrf()
.xframe()
.csp({
  defaultSrc: [ editorHost ],
  frameSrc: [ editorHost, homepageVideoLink ],
  childSrc: [ editorHost, homepageVideoLink ],
  scriptSrc: [ editorHost ],
  connectSrc: [ editorHost ]
});
if(!!env.get("FORCE_SSL")) {
  secure.ssl();
}


/**
 * Static assets
 */
Utils.getFileList(path.join(root, "public"), "!(*.js)")
.forEach(file => server.use(express.static(file, maxCacheAge)));
server.use(express.static(cssAssets, maxCacheAge));
server.use(express.static(path.join(root, "public/resources"), maxCacheAge));
server.use("/node_modules", express.static(path.join(root, server.locals.node_path), maxCacheAge));
// Start logging requests for routes that serve JS
requests.enableLogging(environment);
server.use(express.static(client, maxCacheAge));
// So that we don't break compatibility with existing published projects,
// we serve the remix resources through this route as well
server.use("/resources/remix", express.static(path.join(root, "public/resources/remix"), maxCacheAge));


/**
 * L10N
 */
localize(server, Object.assign(env.get("L10N"), {
   excludeLocaleInUrl: [ "/projects/remix-bar" ]
}));

/**
 * Passport
 */
 passportConfig(passport);

/**
 * API routes
 */
routes.init(server, passport);


/*
 * Error handlers
 */
server.use(HttpError.generic);
server.use(HttpError.notFound);

/*
 * export the server object
 */
 module.exports = server;
