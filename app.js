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
var express = require('express'),
    helmet = require("helmet"),
    i18n = require('webmaker-i18n'),
    lessMiddleWare = require("less-middleware"),
    nunjucks = require('nunjucks'),
    path = require('path'),
    utils = require('./lib/utils'),
    version = require('./package').version,
    wts = require('webmaker-translation-stats');

var appName = "thimble",
    app = express(),
    env = require('./lib/environment'),
    node_env = env.get('NODE_ENV'),
    emulate_s3 = env.get('S3_EMULATION') || !env.get('S3_KEY'),
    WWW_ROOT = path.resolve(__dirname, 'public'),

    middleware = require('./lib/middleware')(),
    errorhandling= require('./lib/errorhandling'),
    logger,
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
        middleware.setUserIfTokenExists,
        routes.getProject);

app.get('/project/:projectId',
        middleware.checkForAuth,
        middleware.setUserIfTokenExists,
        routes.openProject);

app.get('/projectExists/:projectName',
        middleware.checkForAuth,
        middleware.setUserIfTokenExists,
        routes.projectExists);

app.get('/newProject/:projectName',
        middleware.checkForAuth,
        middleware.setUserIfTokenExists,
        routes.newProject);

app['delete']('/deleteProject/:projectId',
              middleware.checkForAuth,
              middleware.setUserIfTokenExists,
              routes.deleteProject);

app.put('/updateProjectFile',
        middleware.setUserIfTokenExists,
        middleware.isProjectLoaded,
        routes.createOrUpdateProjectFile);

app.put('/deleteProjectFile',
        middleware.setUserIfTokenExists,
        middleware.isProjectLoaded,
        routes.deleteProjectFile);

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

// run server
app.listen(env.get("PORT"), function(){
  console.log('Express server listening on ' + env.get("APP_HOSTNAME"));
});

// If we're in running in emulated S3 mode, run a mini
// server for serving up the "s3" published content.
if (emulate_s3) {
  require("mox-server").runServer(env.get("MOX_PORT", 12319));
}
