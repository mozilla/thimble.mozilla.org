/**
 * Module dependencies.
 */

var express = require('express')
  , nunjucks = require('nunjucks')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , ajax = require('request')
  , sanitize = require('htmlsanitizer')
  , sqlite = require('sqlite3')
  , async = require('async');

var app = express(),
    nunjucksEnv,
    // whitelist for HTML5 elements
    ALLOWED_TAGS = [
      "!doctype", "html", "body", "a", "abbr", "address", "area", "article",
      "aside", "audio", "b", "base", "bdi", "bdo", "blockquote", "body", "br",
      "button", "canvas", "caption", "cite", "code", "col", "colgroup",
      "command", "datalist", "dd", "del", "details", "dfn", "div", "dl", "dt",
      "em", "embed", "fieldset", "figcaption", "figure", "footer", "form",
      "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr",
      "html", "i", "iframe", "img", "input", "ins", "keygen", "kbd", "label",
      "legend", "li", "link", "map", "mark", "menu", "meta", "meter", "nav", 
      "noscript", "object", "ol", "optgroup", "option", "output", "p", "param",
      "pre", "progress", "q", "rp", "rt", "s", "samp", "section", "select",
      "small", "source", "span", "strong", "style", "sub", "summary", "sup", 
      "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time",
      "title", "tr", "track", "u", "ul", "var", "video", "wbr"
    ],
    // whitelist for HTML5 element attributes.
    ALLOWED_ATTRS = {
      "meta": ["charset", "name", "content"],
      "*": ["class", "id", "style"],
      "img": ["src", "width", "height"],
      "a": ["href"],
      "base": ["href"],
      "iframe": ["src", "width", "height", "frameborder", "allowfullscreen"],
      "video": ["controls", "autoplay", "preload", "loop", "mediaGroup", "src",
                "poster", "muted", "width", "height"],
      "audio": ["controls", "autoplay", "preload", "loop", "src"],
      "source": ["src", "type"],
      "link": ["href", "rel", "type"]
    };

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'learning_projects')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Tell express where to find our templates.
nunjucksEnv = new nunjucks.Environment(new nunjucks.FileSystemLoader('views'));
nunjucksEnv.express(app);

// base dir lookup
app.get('/', function(req, res) {
  res.render('index.html');
});

// learning project lookup
app.get('/projects/:name', function(req, res) {
  var tpl = nunjucksEnv.getTemplate('learning_projects/' + req.params.name + '.html' );
  var content = tpl.render({HTTP_STATIC_URL: '/learning_projects/'}).replace(/'/g, '\\\'').replace(/\n/g, '\\n');
  res.render('index.html', {template: content, HTTP_STATIC_URL: '/'});
});

// lookup for remixing someone's project (from db)
app.get("/remix/:id/edit", function(req, res) {
  async.waterfall([
    // do we have a project to work with?
    function(callback) {
      console.error("1");
      var id = (req.params.id | 0);
      if(id === 0) { return callback("request did not point to a project"); }
      callback(null, id);
    },

    // try to get to our database
    function(id, callback) {
      console.error("2");
      var db = new sqlite.Database('thimble.sqlite', function(err) {
        if(err!=null) { return callback(err); }
        callback(null, id, db);
      });
    },

    // try to write the raw and sanitized data to the DB
    function(id, db, callback) {
      console.error("3");
      db.serialize(function() {
        db.get("SELECT * FROM test WHERE rowid = ?", [id], function(err, row) {
          if(err!=null) { return callback(err); }
          callback(null, db, row);
        });
      });
    },

    // get our new row number
    function(db, row, callback) {
      console.error("4 - " + row.raw);
      db.close();
      callback(null, row.raw);
    }
  ],

  // final callback
  function (err, content) {
   console.error("end");
    if(err) { res.send("could not publish, "+err); }
    else if(!content) { res.send("could not publish: content was empty"); }
    else {
      content = content.replace(/'/g, '\\\'').replace(/\n/g, '\\n');
      res.render('index.html', {template: content, HTTP_STATIC_URL: '/'});
    }
    res.end();
  });
});

// get a published page (from db)
app.get("/remix/:id", function(req, res) {
  async.waterfall([
    // do we have a project to work with?
    function(callback) {
      console.error("1");
      var id = (req.params.id | 0);
      if(id === 0) { return callback("request did not point to a project"); }
      callback(null, id);
    },

    // try to get to our database
    function(id, callback) {
      console.error("2");
      var db = new sqlite.Database('thimble.sqlite', function(err) {
        if(err!=null) { return callback(err); }
        callback(null, id, db);
      });
    },

    // try to write the raw and sanitized data to the DB
    function(id, db, callback) {
      console.error("3");
      db.serialize(function() {
        db.get("SELECT * FROM test WHERE rowid = ?", [id], function(err, row) {
          if(err!=null) { return callback(err); }
          callback(null, db, row);
        });
      });
    },

    // get our new row number
    function(db, row, callback) {
      console.error("4 - " + row.raw);
      db.close();
      callback(null, row.raw);
    }
  ],

  // final callback
  function (err, result) {
   console.error("end");
    if(err) { res.send("could not publish, "+err); }
    else { res.send(result); }
    res.end();
  });
});

// publish a remix (to the db)
app.post('/publish', function(req, res) {
  async.waterfall([

    // do we have actual data to publish?
    function(callback) {
      console.error("1");
      var data = ( req.body.html ? req.body.html : "" );
      if(data=="") { return callback("request had no publishable content"); }
      callback(null, data);
    },

    // try to sanitize the raw data
    function(data, callback) {
      console.error("2");
      sanitize( {
        url: 'http://htmlsanitizer.org',
        text: data,
        tags: ALLOWED_TAGS,
        attributes: ALLOWED_ATTRS,
        styles: [],
        strip: false,
        strip_comments: false
      }, function(err, sanitizedData) {
        if(err) { return callback(err); }
        callback(null, data, sanitizedData);
      });
    },

    // try to get to our database
    function(rawData, sanitizedData, callback) {
      console.error("3");
      var db = new sqlite.Database('thimble.sqlite', function(err) {
        if(err!=null) { return callback(err); }
        callback(null, db, rawData, sanitizedData);
      });
    },

    // try to write the raw and sanitized data to the DB
    function(db, rawData, sanitizedData, callback) {
      console.error("4");
      db.serialize(function() {
        // replace with http://stackoverflow.com/questions/1601151/how-do-i-check-in-sqlite-whether-a-table-exists or like
        db.run("CREATE TABLE test (raw TEXT, sanitized TEXT)",function(err) {
          // don't care about errors here, atm, since it'll be of the
          // type "table already exists", so that's fine.
        });
        db.run("INSERT INTO test VALUES (?, ?)", [rawData, sanitizedData], function(err) {
          if(err!=null) { return callback(err); }
          callback(null, db);
        });
      });
    },

    // get our new row number
    function(db, callback) {
      console.error("5");
      // NOTE: this totally doesn't work in async concurrent settings, so we need to get
      // the rowid from the actual insert at some point (way) before deploy.
      db.get("SELECT count(*) as totalCount FROM test", function(err, row) {
        if(err!=null) { return callback(err); }
        callback(null, db, row.totalCount);
      });
    },

    // form a "load from..." URL based on our row number
    function(db, resultId, callback) {
      db.close();
      var result = { 'published-url' : 'http://www.example.com/' + resultId };
      callback(null, result);
    }
  ],

  // final callback
  function (err, result) {
   console.error("end");
    if(err) { res.send("could not publish, "+err); }
    else { res.json(result); }
    res.end();
  });
});

// run server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

