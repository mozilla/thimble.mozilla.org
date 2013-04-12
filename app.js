/**
 * Module dependencies.
 */

var express = require('express')
  , nunjucks = require('nunjucks')
  , routes = require('./routes')
  , habitat = require('habitat')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , ajax = require('request')
  , sanitize = require('htmlsanitizer')
  , sqlite = require('sqlite3')
  , async = require('async')
  , fs = require('fs');

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

// asdf is only a default if an env variable for secret is not set.
// You can set this by running this file with
// THIMBLE_SECRET=newsecretasdf node app
var habitatEnv = new habitat("thimble", {secret: "asdf"});

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.cookieSession({secret: habitatEnv.get('secret')}));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'learning_projects')));

require('express-persona')(app, {
  audience: "http://calm-headland-1764.herokuapp.com"
});

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

// learning project listing
app.get('/projects', function(req, res) {
  fs.readdir('learning_projects', function(err, files){
    if(err) { res.end(); return; }
    var response = "<h1>GALLERY TYPE TEMPLATE GOES HERE</h1>\n";
    files.forEach( function(e) {
      console.error(e);
      e = e.replace('.html','');
      response += "<a href='/projects/" + e + "'>" + e + "</a><br>\n";
    });
    res.send(response);
    res.end();
  });
});

// learning project lookup
app.get('/projects/:name', function(req, res) {
  var tpl = nunjucksEnv.getTemplate('learning_projects/' + req.params.name + '.html' );
  var content = tpl.render({HTTP_STATIC_URL: '/learning_projects/'}).replace(/'/g, '\\\'').replace(/\n/g, '\\n');
  res.render('index.html', {template: content, HTTP_STATIC_URL: '/'});
});

// load up someone's project for editing (from db)
app.get("/remix/:id/edit", function(req, res) {
  async.waterfall([
    // do we have a project to work with?
    function(callback) {
      var id = (req.params.id | 0);
      if(id === 0) { return callback("request did not point to a project"); }
      callback(null, id);
    },

    // try to get to our database
    function(id, callback) {
      var db = new sqlite.Database('thimble.sqlite', function(err) {
        if(err!=null) { return callback(err); }
        callback(null, id, db);
      });
    },

    // grab this project's data from the db
    function(id, db, callback) {
      db.serialize(function() {
        db.get("SELECT * FROM test WHERE rowid = ?", [id], function(err, row) {
          if(err!=null) { return callback(err); }
          // FIXME: note that we're not pulling up the "real" raw data. we're still grabbing sanitized data.
          callback(null, db, row.sanitized);
        });
      });
    },

    // we're done, close the db
    function(db, data, callback) {
      db.close();
      callback(null, data);
    }
  ],

  // final callback
  function (err, content) {
    if(err) { res.send("could not publish, "+err); }
    else if(!content) { res.send("could not publish: content was empty"); }
    else {
      // load up the content for mixing.
      content = content.replace(/'/g, '\\\'').replace(/\n/g, '\\n');
      res.render('index.html', {template: content, HTTP_STATIC_URL: '/'});
    }
    res.end();
  });
});

// view a published page (from db)
app.get("/remix/:id", function(req, res) {
  async.waterfall([
    // do we have a project to work with?
    function(callback) {
      var id = (req.params.id | 0);
      if(id === 0) { return callback("request did not point to a project"); }
      callback(null, id);
    },

    // try to get to our database
    function(id, callback) {
      var db = new sqlite.Database('thimble.sqlite', function(err) {
        if(err!=null) { return callback(err); }
        callback(null, id, db);
      });
    },

    // grab this project's data from the db
    function(id, db, callback) {
      db.serialize(function() {
        db.get("SELECT * FROM test WHERE rowid = ?", [id], function(err, row) {
          if(err!=null) { return callback(err); }
          callback(null, db, row.sanitized);
        });
      });
    },

    // we're done, close the db
    function(db, data, callback) {
      db.close();
      callback(null, data);
    }
  ],

  // final callback
  function (err, result) {
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
      // logged in?
      var personaId = req.session.email;
      if(personaId==null) { return callback("you'll have to log in to publish"); }
      // is there data?
      var data = ( req.body.html ? req.body.html : "" );
      if(data=="") { return callback("request had no publishable content"); }
      // is there a "we are remixing id ... " indicator
      var originalRecord = req.body['original-url'];
      if(originalRecord) {
        originalRecord = originalRecord.substring(originalRecord.lastIndexOf('/')+1);
      };
      console.error(originalRecord);
      callback(null, personaId, data, originalRecord);
    },

    // try to sanitize the raw data
    function(personaId, data, originalRecord, callback) {
      sanitize( {
        endpoint: 'http://peaceful-crag-3591.herokuapp.com',
        text: data,
        tags: ALLOWED_TAGS,
        attributes: ALLOWED_ATTRS,
        styles: [],
        strip: false,
        strip_comments: false,
        parse_as_fragment: false,
      }, function(err, sanitizedData) {
        if(err) { return callback(err); }
        callback(null, personaId, data, sanitizedData, originalRecord);
      });
    },

    // try to get to our database
    function(personaId, rawData, sanitizedData, originalRecord, callback) {
      var db = new sqlite.Database('thimble.sqlite', function(err) {
        if(err!=null) { return callback(err); }
        callback(null, db, personaId, rawData, sanitizedData, originalRecord);
      });
    },

    // try to write the raw and sanitized data to the DB
    function(db, personaId, rawData, sanitizedData, originalRecord, callback) {
      db.serialize(function() {
        // replace with http://stackoverflow.com/questions/1601151/how-do-i-check-in-sqlite-whether-a-table-exists or like
        db.run("CREATE TABLE IF NOT EXISTS test (personaid TEXT, raw TEXT, sanitized TEXT)", function(err) {
          if(err!=null) return callback(err);

          // do we own this remix? if so, update. Otherwise, write.
          db.get("SELECT count(*) as count FROM test WHERE rowid = ? AND personaid = ?",
            [originalRecord, personaId],
            function(err, row) {
              if(err!=null) { return callback(err); }

              // if we don't own [originalRecord], write a new entry:
              if(row.count == 0 ) {
                db.run("INSERT INTO test VALUES (?, ?, ?)",
                  [personaId, rawData, sanitizedData],
                  function(err, result) {
                    if(err!=null) { return callback(err); }
                    callback(null, db, this.lastID);
                  }
                );
              }

              // otherwise, update it with this new content:
              else {
                db.run("UPDATE test SET raw = ?, sanitized = ? WHERE rowid = ?",
                  [rawData, sanitizedData, originalRecord],
                  function(err, result) {
                    if(err!=null) { return callback(err); }
                    callback(null, db, originalRecord);
                  }
                );
              }
            }
          );
        });
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
    debugger;
    if(err) { res.send("could not publish, "+err); }
    else { res.json(result); }
    res.end();
  });
});

// run server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

