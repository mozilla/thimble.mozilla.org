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
    makeAPI = require('./lib/makeapi'),
    mysql = require('mysql'),
    nunjucks = require('nunjucks'),
    path = require('path'),
    persona = require('express-persona'),
    routes = require('./routes'),
    utils = require('./lib/utils');

habitat.load();

var app = express(),
    appName = "thimble",
    env = new habitat(),
    loginAPI = require('webmaker-loginapi')(env.get('LOGINAPI')),
    middleware = require('./lib/middleware')(env),
    make = makeAPI(env.get('make')),
    nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader('views'));

databaseAPI = db(env.get('CLEARDB_DATABASE_URL') || env.get('DB')),
nunjucksEnv.express(app);

// all environments
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.compress());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.cookieSession({
  key: "thimble.sid",
  secret: env.get('SESSION_SECRET')
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'learning_projects')));
app.use(express.static(path.join(__dirname, 'templates')));

// learning project listing
app.get('/projects', function(req, res) {
  fs.readdir('learning_projects', function(err, files){
    if(err) { res.send(404); return; }
    var projects = [];
    files.forEach( function(e) {
      var id = e.replace('.html','');
      projects.push({
        title: id,
        edit: id,
        view: "/" + id + ".html"
      });
    });
    res.render('gallery.html', {location: "projects", title: 'Learning Projects', projects: projects});
  });
});

// "my projects" listing -- USED FOR DEV WORK ATM, MAY NOT BE PERMANENT IN ANY WAY
app.get('/myprojects',
  middleware.checkForAuth,
  function(req, res) {
    make.search({email: req.session.email}, function(err, results) {
      var projects = [];
      if (results) {
        projects = results.map(function(result) {
          var url = result.url;
          return {
            title: result.title || url,
            edit: url + "/edit",
            view: url
          };
        });
      }
      res.render('gallery.html', {title: 'User Projects', projects: projects});
    });
  }
);

// what do we do when a project request comes in by id (:id route)?
app.param('id', function(req, res, next, id) {
  databaseAPI.find(id, function(err, result) {
    if (err) { return next( err ); }
    if (!result) { return next( new Error("404 Not Found") ); }
    req.pageData = result.sanitizedData;
    next();
  });
});

// Main page
app.get('/',
        middleware.setDefaultPublishOperation,
        routes.index(utils, env, appName));

// Remix a published page (from db)
// Even if this is "our own" page, this URL
// will effect a new page upon publication.
app.get('/remix/:id/remix',
        middleware.setDefaultPublishOperation,
        routes.index(utils, env, appName));

// Edit a published page (from db).
// If this is not "our own" page, this will
// effect a new page upon publication.
// Otherwise, the edit overwrites the
// existing page instead.
app.get('/remix/:id/edit',
        middleware.setPublishAsUpdate,
        routes.index(utils, env, appName));

// view a published page (from db)
app.get('/remix/:id', function(req, res) {
  res.send(req.pageData);
});

// what do we do when a project request comes in by name (:name route)?
app.param('name', function(req, res, next, name) {
  req.pageToLoad = '/' + name + '.html';
  next();
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
         middleware.checkForOriginalPage(databaseAPI),
         bleach.bleachData(env.get("BLEACH_ENDPOINT")),
         middleware.saveData(databaseAPI, env.get('HOSTNAME')),
         middleware.rewritePublishId(databaseAPI),
         middleware.finalizeProject(nunjucksEnv, env),
         middleware.publishData(env.get('S3')),
         middleware.rewriteUrl(env.get('USER_SUBDOMAIN')),
         middleware.publishMake(make),
  function(req, res) {
    res.json({
      'published-url': req.publishedUrl,
      'remix-id': req.publishId
    });
  }
);


/**
 * WEBMAKER SSO
 */
persona(app, {audience: env.get( "AUDIENCE" )});

app.get( "/user/:userid", function( req, res ) {
  loginAPI.getUser(req.session.email, function(err, user) {
    if(err || !user) {
      return res.json({
        status: "failed",
        reason: (err || "user not defined")
      });
    }
    req.session.webmakerid = user.subdomain;
    res.json({
      status: "okay",
      user: user
    });
  });
});
/**
 * END WEBMAKER SSO
 */


// run server
app.listen(env.get("PORT"), function(){
  console.log('Express server listening on ' + env.get("HOSTNAME"));
});
