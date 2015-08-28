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
    csrf = require('csurf'),
    useragent = require('express-useragent');

var appName = "thimble",
    app = express(),
    env = require('./lib/environment'),
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

app.disable('x-powered-by');
app.use(compress());

// adding Content Security Policy (CSP)
app.use(middleware.addCSP({
  personaHost: env.get('PERSONA_HOST'),
  brambleHost: env.get('BRAMBLE_URI')
}));

app.use(favicon(__dirname + '/public/resources/img/favicon.png'));

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

var optimize = (env.get( "NODE_ENV" ) !== "development"),
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

// Temporary fix to warn users in some browsers of UI issues
app.use(useragent.express());

routes.init(app, middleware);

// We only want to allow CORS on our public resources
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
app.use(express.static(tmpDir, {maxAge: "1d"}));
app.use('/dist', express.static(path.join(__dirname, 'dist'), {maxAge: "1d"}));
app.use(express.static(path.join(__dirname, 'public'), {maxAge: "1d"}));
app.use(express.static(path.join(__dirname, 'public/resources'), {maxAge: "1d"}));
app.use(express.static(path.join(__dirname, 'learning_projects'), {maxAge: "1d"}));
app.use(express.static(path.join(__dirname, 'templates'), {maxAge: "1d"}));
app.use( "/bower", express.static( path.join(__dirname, "bower_components" ), {maxAge: "1d"}));

// what do we do when a project request comes in by name (:name route)?
app.param('name', parameters.name);

// resource proxying for http-on-https
webmakerProxy(app, middleware.checkForAuth);

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
