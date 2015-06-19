process.env.NEW_RELIC_BROWSER_MONITOR_ENABLE = false;

// New Relic Server monitoring support
var newrelic;
if ( process.env.NEW_RELIC_ENABLED ) {
  newrelic = require( "newrelic" );
} else {
  newrelic = {
    getBrowserTimingHeader: function () {
      return "<!-- New Relic RUM disabled -->";
    }
  };
}

/**
 * Module dependencies.
 */
var ajax = require('request'),
    async = require('async'),
    express = require('express'),
    fs = require('fs'),
    habitat = require('habitat'),
    helmet = require("helmet"),
    i18n = require('webmaker-i18n'),
    lessMiddleWare = require("less-middleware"),
    makeAPI = require('./lib/makeapi'),
    nunjucks = require('nunjucks'),
    path = require('path'),
    utils = require('./lib/utils'),
    version = require('./package').version,
    WebmakerAuth = require('webmaker-auth'),
    wts = require('webmaker-translation-stats');

var appName = "thimble",
    app = express(),
    env = require('./lib/environment'),
    node_env = env.get('NODE_ENV'),
    emulate_s3 = env.get('S3_EMULATION') || !env.get('S3_KEY'),
    WWW_ROOT = path.resolve(__dirname, 'public'),
    /**
      We're using two databases here: the first is our normal database, the second is
      a legacy database with old the original thimble.webmaker.org data from 2012/2013
      prior to the webmaker.org reboot. This database is a read-only database, with
      remixes/edits being published to the new database instead. This is intended as
      a short-term solution until all the active "old thimble" projects have been
      migrated by their owners/remixers.
    **/
    databaseOptions =  env.get('CLEARDB_DATABASE_URL') || env.get('DB'),

    allowJS = env.get("JAVASCRIPT_ENABLED", false),
    middleware = require('./lib/middleware')(),
    errorhandling= require('./lib/errorhandling'),
    logger,
    make = makeAPI(env.get('make')),
    messina,
    nunjucksEnv = new nunjucks.Environment([
      new nunjucks.FileSystemLoader('views'),
      new nunjucks.FileSystemLoader('learning_projects'),
      new nunjucks.FileSystemLoader('bower_components')
    ], {
      autoescape: true
    }),
    parameters = require('./lib/parameters')(),
    routes = require('./routes')( utils, nunjucksEnv, appName ),
    webmakerProxy = require('./lib/proxy')(),

    bracketsPath;

function configuredCookieSession() {
  var options = {
    key: "mozillaThimble",
    secret: env.get('SESSION_SECRET'),
    cookie: {
      expires: false,
      secure: env.get('FORCE_SSL')
    },
    proxy: true
  };

  var cookieSessionMiddleware = express.cookieSession(options);

  // This is a work-around for cross-origin OPTIONS requests
  // See https://github.com/senchalabs/connect/issues/323
  return function (req, res, next) {
    if (req.method.toLowerCase() === 'options') {
      return next();
    } else {
      cookieSessionMiddleware(req, res, next);
    }
  };
}

if (env.get("NODE_ENV") === "development") {
  bracketsPath = '/public/friendlycode/vendor/brackets/src';
} else {
  bracketsPath = '/public/friendlycode/vendor/brackets/dist';
}

require("./lib/extendnunjucks").extend(nunjucksEnv, nunjucks);

nunjucksEnv.express(app);

// adding Content Security Policy (CSP)
app.use(middleware.addCSP({
  personaHost: env.get('PERSONA_HOST'),
  previewLoader: env.get('PREVIEW_LOADER'),
  togetherJS: env.get('TOGETHERJS'),
  brambleHost: env.get('BRAMBLE_URI')
}));

// Express settings
app.disable('x-powered-by');
app.use(express.favicon(__dirname + '/public/img/favicon.ico'));

if ( env.get( "ENABLE_GELF_LOGS" ) ) {
  messina = require( "messina" );
  logger = messina( "thimble.webmaker.org-" + env.get( "NODE_ENV" ) || "development" );
  logger.init();
  app.use( logger.middleware() );
} else {
  app.use( express.logger( "dev" ) );
}

app.use(helmet.iexss());
app.use(helmet.contentTypeOptions());

if (!!env.get("FORCE_SSL") ) {
  app.use(helmet.hsts());
  app.enable("trust proxy");
}
app.use(express.compress());
app.use(express.json());
app.use(express.urlencoded());

app.use(express.cookieParser());
app.use(configuredCookieSession());

app.use( i18n.middleware({
  supported_languages: env.get( "SUPPORTED_LANGS" ),
  default_lang: "en-US",
  mappings: require("webmaker-locale-mapping"),
  translation_directory: path.resolve( __dirname, "locale" )
}));

app.locals({
  GA_ACCOUNT: env.get("GA_ACCOUNT"),
  GA_DOMAIN: env.get("GA_DOMAIN"),
  languages: i18n.getSupportLanguages(),
  newrelic: newrelic,
  bower_path: "bower_components"
});

app.use(express.csrf());
app.use(helmet.xframe());
app.use(app.router);

var optimize = (node_env !== "development"),
    tmpDir = path.join( require("os").tmpDir(), "mozilla.webmaker.org");

app.use(lessMiddleWare('public', {
  once: optimize,
  debug: !optimize,
  dest: tmpDir,
  src: WWW_ROOT,
  compress: true,
  yuicompress: optimize,
  optimization: optimize ? 0 : 2
}));

app.use( express.static(tmpDir));

// Allows us to embed our version of brackets
// in an iframe
app.use(function(req, res, next) {
  res.set('X-Frame-Options', "SAMEORIGIN");
  next();
}, express.static(path.join(__dirname, bracketsPath)));

app.use( express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'learning_projects')));
app.use(express.static(path.join(__dirname, 'templates')));

// Setting up bower_components
app.use( "/bower", express.static( path.join(__dirname, "bower_components" )));

// Shim the slowparse library so that friendlycode thinks it
// still lives in public/friendlycode/vendor/slowparse
app.use( "/friendlycode/vendor/slowparse", express.static( path.join(__dirname, "node_modules/slowparse" )));

// Error handler
app.use(errorhandling.errorHandler);
app.use(errorhandling.pageNotFoundHandler);

// what do we do when a project request comes in by name (:name route)?
app.param('name', parameters.name);

// oauth2
app.get("/callback", routes.oauth2Callback);

// resource proxying for http-on-https
webmakerProxy(app, middleware.checkForAuth);

// Main page
app.get('/',
        middleware.setNewPageOperation,
        middleware.setUserIfTokenExists,
        routes.index );

app.get('/initializeProject',
        middleware.checkForAuth,
        routes.getProject);

app.get('/project/:projectId', routes.openProject);

app.get('/projectExists/:projectName', routes.projectExists);

app.get('/newProject/:projectName', routes.newProject);

app.put('/updateProjectFile', routes.createOrUpdateProjectFile);

app.put('/deleteProjectFile', routes.deleteProjectFile);

// Localized Strings
app.get( '/strings/:lang?', i18n.stringsRoute( 'en-US' ) );

app.get( '/external/make-api.js', function( req, res ) {
  res.sendfile( path.resolve( __dirname, "node_modules/makeapi-client/src/make-api.js" ) );
});

routes.friendlycodeRoutes(app);

// DEVOPS - Healthcheck
app.get('/healthcheck', function( req, res ) {
  var healthcheckObject = {
    http: 'okay',
    version: version
  };
  wts(i18n.getSupportLanguages(), path.join(__dirname, 'locale'), function(err, data) {
    if(err) {
      healthcheckObject.locales = err.toString();
    } else {
      healthcheckObject.locales = data;
    }
    res.json(healthcheckObject);
  });
});

// dev-only route for testing deletes.
if (!!env.get("DELETE_ENABLED")) {
  /**
    This route only exists for testing. Since CSRF cannot be
    "overruled", this is a .get route, conditional on dev env.
  **/
  app.get('/project/:id/delete', middleware.deleteProject(databaseAPI));
}

// run server
app.listen(env.get("PORT"), function(){
  console.log('Express server listening on ' + env.get("APP_HOSTNAME"));
});

// If we're in running in emulated S3 mode, run a mini
// server for serving up the "s3" published content.
if (emulate_s3) {
  require("mox-server").runServer(env.get("MOX_PORT", 12319));
}
