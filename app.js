// New Relic Server monitoring support
if ( process.env.NEW_RELIC_ENABLED ) {
  require( "newrelic" );
}

/**
 * Module dependencies.
 */
var ajax = require('request'),
    async = require('async'),
    bleach = require( "./lib/bleach"),
    db = require('./lib/database'),
    express = require('express'),
    fs = require('fs'),
    habitat = require('habitat'),
    helmet = require("helmet"),
    lessMiddleWare = require("less-middleware"),
    makeAPI = require('./lib/makeapi'),
    nunjucks = require('nunjucks'),
    path = require('path'),
    routes = require('./routes'),
    utils = require('./lib/utils'),
    version = require('./package').version;


habitat.load();

var appName = "thimble",
    app = express(),
    env = new habitat(),
    node_env = env.get('NODE_ENV'),
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

    middleware = require('./lib/middleware')(env),
    make = makeAPI(env.get('make')),
    nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader('views'), {
      autoescape: true
    }),
    parameters = require('./lib/parameters');

nunjucksEnv.express(app);
app.locals({
  GA_ACCOUNT: env.get("GA_ACCOUNT"),
  GA_DOMAIN: env.get("GA_DOMAIN")
});

// Express settings
app.use(express.favicon());
app.use(express.logger("dev"));
if (!!env.get("FORCE_SSL") ) {
  app.use(helmet.hsts());
  app.enable("trust proxy");
}
app.use(express.compress());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.cookieSession({
  key: "thimble.sid",
  secret: env.get("SESSION_SECRET"),
  cookie: {
    maxAge: 2678400000, // 31 days. Persona saves session data for 1 month
    secure: !!env.get("FORCE_SSL")
  },
  proxy: true
}));
app.use(express.csrf());
app.use(helmet.xframe());
app.use(app.router);

var optimize = (node_env !== "development"),
    tmpDir = path.join( require("os").tmpDir(), "mozilla.webmaker.org");

app.use(lessMiddleWare({
  once: true,
  debug: !optimize,
  dest: tmpDir,
  src: WWW_ROOT,
  compress: true,
  yuicompress: optimize,
  optimization: optimize ? 0 : 2
}));

app.use( express.static(tmpDir));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'learning_projects')));
app.use(express.static(path.join(__dirname, 'templates')));

app.use( function(err, req, res, next) {
  res.send( 500, err );
});

// what do we do when a project request comes in by id (:id route)?
app.param('id', parameters.id(databaseAPI));

// what do we do when a project request comes in by id (:oldid route)?
app.param('oldid', parameters.oldid(legacyDatabaseAPI));

// what do we do when a project request comes in by name (:name route)?
app.param('name', parameters.name);

// Main page
app.get('/',
        middleware.setNewPageOperation,
        routes.index(utils, env, appName));

// Legacy route for the main page
app.get('/en-US/editor',
        middleware.setNewPageOperation,
        routes.index(utils, env, appName));

// Remix a published page (from db)
// Even if this is "our own" page, this URL
// will effect a new page upon publication.
app.get('/project/:id/remix',
        middleware.setDefaultPublishOperation,
        routes.index(utils, env, appName));

// Legacy route for remixing old user content
app.get('/p/:oldid/remix',
        middleware.setDefaultPublishOperation,
        routes.index(utils, env, appName));

// Edit a published page (from db).
// If this is not "our own" page, this will
// effect a new page upon publication.
// Otherwise, the edit overwrites the
// existing page instead.
app.get('/project/:id/edit',
        middleware.setPublishAsUpdate,
        routes.index(utils, env, appName));

// Legacy route for new premade content
// See: https://bugzilla.mozilla.org/show_bug.cgi?id=874986
app.get('/en-US/projects/:name/edit',
        middleware.setDefaultPublishOperation,
        routes.index(utils, env, appName));

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
        routes.index(utils, env, appName));

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
        routes.index(utils, env, appName));

// project template lookups
app.get('/templates/:name',
        middleware.setDefaultPublishOperation,
        routes.index(utils, env, appName));

// publish a remix (to the db)
app.post('/publish',
         middleware.checkForAuth,
         middleware.checkForPublishData,
         middleware.ensureMetaData,
         middleware.sanitizeMetaData,
         middleware.checkPageOperation(databaseAPI),
         bleach.bleachData(env.get("BLEACH_ENDPOINT")),
         middleware.saveData(databaseAPI, env.get('HOSTNAME')),
         middleware.rewritePublishId(databaseAPI),
         middleware.generateUrls(appName, env.get('S3'), env.get('USER_SUBDOMAIN')),
         middleware.finalizeProject(nunjucksEnv, env),
         middleware.publishData(env.get('S3')),
         middleware.rewriteUrl,
         // update the database now that we have a S3-published URL
         middleware.saveUrl(databaseAPI, env.get('HOSTNAME')),
         middleware.getRemixedFrom(databaseAPI, make),
         middleware.publishMake(make),
  function(req, res) {
    res.json({
      'published-url': req.publishedUrl,
      'remix-id': req.publishId
    });
  }
);

// DEVOPS - Healthcheck
app.get('/healthcheck', function( req, res ) {
  res.json({
    http: "okay",
    version: version
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


// WEBMAKER SSO
require('webmaker-loginapi')(app, {
  loginURL: env.get('LOGINAPI'),
  audience: env.get('AUDIENCE')
});

// run server
app.listen(env.get("PORT"), function(){
  console.log('Express server listening on ' + env.get("HOSTNAME"));
});
