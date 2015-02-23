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
    db = require('./lib/database'),
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

habitat.load();

var appName = "thimble",
    app = express(),
    env = new habitat(),
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
    databaseAPI = db('thimbleproject', databaseOptions),
    legacyDatabaseAPI = db('legacyproject', databaseOptions, env.get('LEGACY_DB')),

    allowJS = env.get("JAVASCRIPT_ENABLED", false),
    middleware = require('./lib/middleware')(env),
    errorhandling= require('./lib/errorhandling'),
    logger,
    make = makeAPI(env.get('make')),
    messina,
    nunjucksEnv = new nunjucks.Environment([
      new nunjucks.FileSystemLoader('views'),
      new nunjucks.FileSystemLoader('learning_projects')
    ], {
      autoescape: true
    }),
    parameters = require('./lib/parameters')(env),
    routes = require('./routes')( utils, env, nunjucksEnv, appName ),
    webmakerAuth = new WebmakerAuth({
      forceSSL: env.get('FORCE_SSL'),
      loginHost: env.get('APP_HOSTNAME'),
      loginURL: env.get('LOGIN_URL'),
      authLoginURL: env.get('LOGIN_URL_WITH_AUTH'),
      secretKey: env.get('SESSION_SECRET'),
      domain: env.get('COOKIE_DOMAIN')
    }),
    webmakerProxy = require('./lib/proxy')(env);

require("./lib/extendnunjucks").extend(nunjucksEnv, nunjucks);

nunjucksEnv.express(app);

// adding Content Security Policy (CSP)
app.use(middleware.addCSP({
  personaHost: env.get('PERSONA_HOST'),
  previewLoader: env.get('PREVIEW_LOADER'),
  togetherJS: env.get('TOGETHERJS')
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

app.use(webmakerAuth.cookieParser());
app.use(webmakerAuth.cookieSession());

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

app.use(lessMiddleWare({
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
// in an iframe on the client
app.use(function(req, res, next) {
  res.set('X-Frame-Options', "SAMEORIGIN");
  next();
}, express.static(path.join(__dirname, 'public/friendlycode/vendor/brackets/dist')));

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

// what do we do when a project request comes in by id (:id route)?
app.param('id', parameters.id(databaseAPI));

// what do we do when a project request comes in by id (:oldid route)?
app.param('oldid', parameters.oldid(legacyDatabaseAPI));

// what do we do when a project request comes in by name (:name route)?
app.param('name', parameters.name);

// Webmaker SSO
app.post( "/authenticate", webmakerAuth.handlers.authenticate );
app.post( "/logout", webmakerAuth.handlers.logout );
app.post( "/verify", webmakerAuth.handlers.verify );

app.post( "/auth/v2/create", webmakerAuth.handlers.createUser );
app.post( "/auth/v2/uid-exists", webmakerAuth.handlers.uidExists );
app.post( "/auth/v2/request", webmakerAuth.handlers.request );
app.post( "/auth/v2/authenticateToken", webmakerAuth.handlers.authenticateToken );
app.post( "/auth/v2/verify-password", webmakerAuth.handlers.verifyPassword );
app.post( "/auth/v2/request-reset-code", webmakerAuth.handlers.requestResetCode );
app.post( "/auth/v2/reset-password", webmakerAuth.handlers.resetPassword );

// resource proxying for http-on-https
webmakerProxy(app, middleware.checkForAuth);

// Main page
app.get('/',
        middleware.setNewPageOperation,
        routes.index );

// Raw data route, for loading pages to remix
app.get('/project/:id/data', routes.rawData );

// Legacy route for old user content
app.get('/p/:oldid/data', routes.rawData );


// Remix a published page (from db)
// Even if this is "our own" page, this URL
// will effect a new page upon publication.
app.get('/project/:id/remix',
        middleware.setDefaultPublishOperation,
        routes.index );

// Legacy route for remixing old user content
app.get('/p/:oldid/remix',
        middleware.setDefaultPublishOperation,
        routes.index );

// Edit a published page (from db).
// If this is not "our own" page, this will
// effect a new page upon publication.
// Otherwise, the edit overwrites the
// existing page instead.
app.get('/project/:id/edit',
        middleware.setPublishAsUpdate,
        routes.index );

// Legacy route for new premade content
// See: https://bugzilla.mozilla.org/show_bug.cgi?id=874986
app.get('/en-US/projects/:name/edit',
        middleware.setDefaultPublishOperation,
        routes.index );

// Legacy route for old user content
// see: https://bugzilla.mozilla.org/show_bug.cgi?id=880768
app.get('/p/:oldid',function(req, res) {
  res.send(req.pageData);
});

// Legacy route for editing old user content
app.get('/p/:oldid/edit',
        // this will be a remix, since there's no new
        // data to "edit"; old thimble was anonymous.
        middleware.setDefaultPublishOperation,
        routes.index );

// learning project listing
app.get('/projects', function(req, res) {
  fs.readdir('learning_projects', function(err, files){
    if(err) { res.send(404); return; }
    var projects = files.map( function(e) {
      var id = e.replace('.html','');
      return {
        title: id,
        remix: "/projects/" + id + "/",
        view: "/" + id + ".html"
      };
    });
    res.render('gallery.html', {location: "projects", title: 'Learning Projects', projects: projects});
  });
});

// learning project lookup
app.get('/projects/:name',
        middleware.setDefaultPublishOperation,
        routes.index );

app.get('/templated_projects/:project', function(req, res) {
  res.render(req.params.project, {
    hostname: env.get('APP_HOSTNAME')
  });
});

// project template lookups
app.get('/templates/:name',
        middleware.setDefaultPublishOperation,
        routes.index );

// publish a remix (to the db)
app.post('/publish',
         middleware.checkForAuth,
         middleware.checkForPublishData,
         middleware.ensureMetaData,
         middleware.sanitizeMetaData,
         middleware.checkPageOperation(databaseAPI),
         middleware.sanitizeHTML,
         middleware.saveData(databaseAPI, env.get('APP_HOSTNAME')),
         middleware.rewritePublishId(databaseAPI),
         middleware.generateUrls(appName, env.get('S3'), env.get('USER_SUBDOMAIN'), databaseAPI),
         middleware.finalizeProject(env.get("APP_HOSTNAME")),
         middleware.publishData(env.get('S3')),
         middleware.rewriteUrl,
         // update the database now that we have a S3-published URL
         middleware.saveUrl(databaseAPI, env.get('APP_HOSTNAME')),
         middleware.getRemixedFrom(databaseAPI, make),
         middleware.publishMake(make),
  function(req, res) {
    res.json({
      'published-url': req.publishedUrl,
      'remix-id': req.publishId
    });
  }
);

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
