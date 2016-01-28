/**
 * Module dependencies.
 */
var express = require('express'),
    helmet = require("helmet"),
    i18n = require("webmaker-i18n"),
    lessMiddleWare = require("less-middleware"),
    nunjucks = require('nunjucks'),
    path = require('path'),
    utils = require('./lib/utils'),
    version = require('./package').version,
    wts = require('webmaker-translation-stats');

var favicon = require('serve-favicon'),
    cookieSession = require('cookie-session'),
    cookieParser = require('cookie-parser'),
    compress = require('compression'),
    bodyParser = require('body-parser'),
    csrf = require('csurf'),
    logger = require("morgan");

var appName = "thimble",
    app = express(),
    env = require('./lib/environment'),
    WWW_ROOT = path.resolve(__dirname, 'public'),

    middleware = require('./lib/middleware')(),
    errorhandling= require('./lib/errorhandling'),
    nunjucksEnv = new nunjucks.Environment([
      new nunjucks.FileSystemLoader('views'),
      new nunjucks.FileSystemLoader('learning_projects'),
      new nunjucks.FileSystemLoader('bower_components')
    ], {
      autoescape: true
    }),
    routes = require('./routes')(utils, nunjucksEnv, appName);

var isProduction = (env.get( "NODE_ENV" ) !== "development"),
    tmpDir = path.join( require("os").tmpDir(), "mozilla.webmaker.org");

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
app.use(middleware.addCSP({ brambleHost: env.get('BRAMBLE_URI') }));

app.use(favicon(__dirname + '/public/resources/img/favicon.png'));

if(!isProduction) {
  app.use(logger("dev"));
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

var l10n = env.get("L10N");
app.use(i18n.middleware({
  supported_languages: l10n.supported_languages,
  default_lang: "en-US",
  mappings: require("webmaker-locale-mapping"),
  translation_directory: path.resolve(__dirname, l10n.locale_dest)
}));

app.locals.GA_ACCOUNT = env.get("GA_ACCOUNT");
app.locals.GA_DOMAIN = env.get("GA_DOMAIN");
app.locals.languages = i18n.getSupportLanguages();
app.locals.bower_path = "bower_components";

app.use(csrf());
app.use(helmet.xframe());

app.use(lessMiddleWare('public', {
  once: isProduction,
  debug: !isProduction,
  dest: tmpDir,
  src: WWW_ROOT,
  compress: true,
  yuicompress: isProduction,
  optimization: isProduction ? 0 : 2
}));

routes.init(app, middleware);

app.use(express.static(tmpDir, {maxAge: "1d"}));

// We use pre-built resources in production
if (env.get("NODE_ENV") === "production") {
  app.use('/', express.static(path.join(__dirname, 'dist'), {maxAge: "1d"}));
} else {
  app.use('/', express.static(path.join(__dirname, 'public'), {maxAge: "1d"}));
}

app.use(express.static(path.join(__dirname, 'public/resources'), {maxAge: "1d"}));
app.use( "/bower", express.static( path.join(__dirname, "bower_components" ), {maxAge: "1d"}));

// Localized Strings
app.get( '/strings/:lang?', i18n.stringsRoute( 'en-US' ) );

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
