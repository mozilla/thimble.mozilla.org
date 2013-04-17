/**
 * Module dependencies.
 */
var ajax = require('request'),
    async = require('async'),
    express = require('express'), 
    fs = require('fs'),
    habitat = require('habitat'),
    middleware = require( "./lib/middleware"),
    mysql = require('mysql'),
    nunjucks = require('nunjucks'),
    path = require('path'),
    routes = require('./routes'),
    sqlite = require('sqlite3'),
    user = require('./routes/user');

habitat.load();

var app = express(),
    nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader('views')),
    env = new habitat();

nunjucksEnv.express(app);

// all environments
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.compress());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.cookieSession({secret: env.get('secret')}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'learning_projects')));

// set up persona
require('express-persona')(app, { audience: env.get("HOSTNAME") });
if (env.get("NODE_ENV") === "development") {
  app.use(express.errorHandler());
}

// base dir lookup
app.get('/', function(req, res) {
  res.render('index.html', { appURL: env.get("HOSTNAME") } );
});

// learning project listing
app.get('/projects', function(req, res) {
  fs.readdir('learning_projects', function(err, files){
    if(err) { res.end(); return; }
    var response = "<h1>GALLERY TYPE TEMPLATE GOES HERE</h1>\n";
    files.forEach( function(e) {
      e = e.replace('.html','');
      response += "<a href='/projects/" + e + "'>" + e + "</a><br>\n";
    });
    res.send(response);
    res.end();
  });
});

// learning project lookup
app.get('/projects/:name', function(req, res) {
  res.render('index.html', {appURL: env.get("HOSTNAME"), pageToLoad: '/' + req.params.name + '.html', HTTP_STATIC_URL: '/'});
});

// "my projects" listing -- USED FOR DEV WORK ATM, MAY NOT BE PERMANENT IN ANY WAY
app.get('/myprojects',
  middleware.checkForPersonaAuth,
  function(req, res) {
    var db = new sqlite.Database('thimble.sqlite', function(err) {
      if(err) { res.send(err); res.end(); return; }
      db.all("SELECT rowid FROM test WHERE personaid = ?", [req.session.email], function(err, rows) {
        if(err) { res.send(err); res.end(); return; }
        var response = "<h1>MY PROJECTS TEMPLATE GOES HERE</h1>\n", id;
        rows.forEach( function(row) {
          id = row.rowid;
          response += "<a href='/remix/"+id+"'>"+id+"</a> (<a href='/remix/"+id+"/edit'>edit</a>)<br>\n";
        });
        res.send(response);
        res.end();
      });
    });
  }
);

// what do we do when a project request comes in by id (:id route)?
app.param('id', function(req, res, next, id) {
  var db = new sqlite.Database('thimble.sqlite', function(err) {
    if(err) { return next(err); }
    db.get("SELECT * FROM test WHERE rowid = ?", [id], function(err, row) {
      if(err) { return next(err); }
      req.pageData = row.sanitized;
      next();
    });
  });
});

// remix a published page (from db)
app.get("/remix/:id/edit", function(req, res) {
  // This is quite ugly, and we need a better way to inject data
  // into friendlycode. I'm pretty sure it CAN load from URI, we
  // just need to find out how to tell it to...
  var content = req.pageData.replace(/'/g, '\\\'').replace(/\n/g, '\\n');
  res.render('index.html', {
    appURL: env.get("HOSTNAME"),
    template: content, HTTP_STATIC_URL: '/'
  });
});

// view a published page (from db)
app.get("/remix/:id", function(req, res) {
  res.send(req.pageData);
  res.end();
});

// publish a remix (to the db)
app.post('/publish',
         middleware.checkForPersonaAuth,
         middleware.checkForPublishData,
         middleware.checkForOriginalPage,
         middleware.bleachData(env.get("BLEACH_ENDPOINT")),
         middleware.publishData(sqlite),
  function(req, res) {
    res.json({ 'published-url' : env.get('HOSTNAME') + '/' + req.publishId });
    res.end();
  }
);

// run server
app.listen(env.get("PORT"), function(){
  console.log('Express server listening on port ' + env.get("PORT"));
});
