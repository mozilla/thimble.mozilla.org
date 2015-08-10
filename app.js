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

var favicon = require('serve-favicon'),
    cookieSession = require('cookie-session'),
    cookieParser = require('cookie-parser'),
    logger = require('morgan'),
    compress = require('compression'),
    bodyParser = require('body-parser'),
    csrf = require('csurf');

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
    webmakerProxy = require('./lib/proxy')();


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

  var cookieSessionMiddleware = cookieSession(options);

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

require("./lib/extendnunjucks").extend(nunjucksEnv, nunjucks);

nunjucksEnv.express(app);

// adding Content Security Policy (CSP)
app.use(middleware.addCSP({
  personaHost: env.get('PERSONA_HOST'),
  brambleHost: env.get('BRAMBLE_URI')
}));

// Express settings
app.disable('x-powered-by');
app.use(favicon(__dirname + '/public/img/favicon.ico'));

if ( env.get( "ENABLE_GELF_LOGS" ) ) {
  messina = require( "messina" );
  logger = messina( "thimble.webmaker.org-" + env.get( "NODE_ENV" ) || "development" );
  logger.init();
  app.use( logger.middleware() );
} else {
  app.use( logger( "dev" ) );
}

app.use(helmet.xssFilter());
app.use(helmet.noSniff());

if (!!env.get("FORCE_SSL") ) {
  app.use(helmet.hsts());
  app.enable("trust proxy");
}
app.use(compress());
app.use(bodyParser.json({limit: '5MB'}));
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());
app.use(configuredCookieSession());

app.use( i18n.middleware({
  supported_languages: env.get( "SUPPORTED_LANGS" ),
  default_lang: "en-US",
  mappings: require("webmaker-locale-mapping"),
  translation_directory: path.resolve( __dirname, "locale" )
}));

app.locals.GA_ACCOUNT = env.get("GA_ACCOUNT");
app.locals.GA_DOMAIN = env.get("GA_DOMAIN");
app.locals.languages = i18n.getSupportLanguages();
app.locals.newrelic = newrelic;
app.locals.bower_path = "bower_components";

app.use(csrf());
app.use(helmet.xframe());

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

app.use(express.static(tmpDir));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/resources')));
app.use(express.static(path.join(__dirname, 'learning_projects')));
app.use(express.static(path.join(__dirname, 'templates')));

// Setting up bower_components
app.use( "/bower", express.static( path.join(__dirname, "bower_components" )));

// what do we do when a project request comes in by name (:name route)?
app.param('name', parameters.name);

// oauth2
app.get("/callback", routes.oauth2Callback);
app.get("/login", routes.login);

// resource proxying for http-on-https
webmakerProxy(app, middleware.checkForAuth);

// Main page
app.get('/',
        middleware.setNewPageOperation,
        middleware.setUserIfTokenExists,
        routes.index );

app.get('/getFileContents',
        middleware.setUserIfTokenExists,
        middleware.isProjectLoaded,
        routes.getFileContents);

app.get('/getFileMeta',
        middleware.setUserIfTokenExists,
        middleware.isProjectLoaded,
        routes.getFileMetadata);

app.get('/projects',
        middleware.checkForAuth,
        middleware.setUserIfTokenExists,
        middleware.setPublishUser,
        routes.projects);

app.get('/project/:projectId',
        middleware.checkForAuth,
        middleware.setUserIfTokenExists,
        routes.openProject);

app.get('/newProject',
        middleware.setUserIfTokenExists,
        routes.newProject);

app.put('/renameProject',
        middleware.checkForAuth,
        middleware.setUserIfTokenExists,
        middleware.isProjectLoaded,
        middleware.validateRequest(["title"]),
        routes.renameProject);

app['delete']('/deleteProject/:projectId',
              middleware.checkForAuth,
              middleware.setUserIfTokenExists,
              routes.deleteProject);

app.put('/updateProjectFile/:fileId?',
        middleware.checkForAuth,
        middleware.setUserIfTokenExists,
        middleware.isProjectLoaded,
        middleware.fileUpload,
        middleware.validateRequest(["dateUpdated", "bramblePath"]),
        routes.createOrUpdateProjectFile);

app.put('/deleteProjectFile/:fileId',
        middleware.checkForAuth,
        middleware.setUserIfTokenExists,
        middleware.isProjectLoaded,
        middleware.validateRequest(["dateUpdated"]),
        routes.deleteProjectFile);

app.put('/publish',
        middleware.checkForAuth,
        middleware.setUserIfTokenExists,
        middleware.isProjectLoaded,
        middleware.validateRequest(["description", "dateUpdated", "public"]),
        routes.publish);

app.put('/unpublish',
        middleware.checkForAuth,
        middleware.setUserIfTokenExists,
        middleware.isProjectLoaded,
        middleware.validateRequest(["description", "dateUpdated", "public"]),
        routes.unpublish);

app.get('/remix/:projectId',
        middleware.setUserIfTokenExists,
        middleware.setPublishUser,
        routes.remix);

// Tutorial templates
app.get('/tutorial/tutorial.html', routes.tutorialTemplate);
app.get('/tutorial/tutorial-style-guide.html', routes.tutorialStyleGuide);

// Localized Strings
app.get( '/strings/:lang?', i18n.stringsRoute( 'en-US' ) );

app.get( '/external/make-api.js', function( req, res ) {
  res.sendfile( path.resolve( __dirname, "node_modules/makeapi-client/src/make-api.js" ) );
});

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

// Error handler
app.use(errorhandling.errorHandler);
app.use(errorhandling.pageNotFoundHandler);

// run server
app.listen(env.get("PORT"), function(){
  console.log('Express server listening on ' + env.get("APP_HOSTNAME"));
});

// If we're in running in emulated S3 mode, run a mini
// server for serving up the "s3" published content.
if (emulate_s3) {
  require("mox-server").runServer(env.get("MOX_PORT", 12319));
}
