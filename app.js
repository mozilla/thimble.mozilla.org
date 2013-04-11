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
  , sanitize = require('htmlsanitizer');

var app = express(),
    nunjucksEnv,
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

// ...
app.get('/', function(request, response) {
  response.render('index.html');
});

// ...
app.get('/projects/:name', function(request, response) {
  var tpl = nunjucksEnv.getTemplate('learning_projects/' + request.params.name + '.html' );
  var content = tpl.render({HTTP_STATIC_URL: '/learning_projects/'}).replace(/'/g, '\\\'').replace(/\n/g, '\\n');
  response.render('index.html', {template: content, HTTP_STATIC_URL: '/'});
});

// run server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// HACKASAURUS API IMPLEMENTATION

app.get("/remix", function(request, response) {
	console.error("TEST");
  // this does nothing for us, since we publish to AWS.
  // any link that we get in /publish will point to an AWS
  // location, so we're not serving saved content from this app.
  // we only publish through it, and load up templated pages,
  // such as the default, and learning_projects (which can come
  // later. This is P.O.C.)
  response.send("there are no teapots here.");
  response.end();
});

/**
 * PUBLISH DATA
 *
 * 1) get data from request
 * 2) try to bleach it through http://htmlsanitizer.org/
 * 3) if we succeeded in bleaching, we save that data to AWS
 *  3b) for P.O.C., we're actually just going to say "hurray it worked" for now
 */
app.post('/publish', function(req, res) {
  async.waterfall([
    // do we have actual data to publish?
    function(callback) {
      var data = ( req.body.html ? req.body.html : "" );
      if(data=="") { return callback("request had no publishable content"); }
      callback(null, data);
    },
    // try to sanitize the raw data
    function(data, callback) {
      sanitize(
        // sanitization options
        { url: 'http://htmlsanitizer.org',
          text: data,
          tags: ALLOWED_TAGS,
          attributes: ALLOWED_ATTRS,
          styles: [],
          strip: false,
          strip_comments: false,
          parse_as_fragment: false
        },
        function(err, sanitizedData) {
          if(err) { return callback(err); }
          callback(null, data, sanitizedData);
        }
      );
    },
    // try to get to our database
    function(rawData, sanitizedData, callback) {
      var db = new sqlite3.Database('thimble.sqlite', function(err) {
        if(err!=null) { return callback(err); }
        callback(null, db, rawData, sanitizedData);
      });
    },
    // try to write the raw and sanitized data to the DB
    function(db, rawData, sanitizedData, callback) {
      db.serialize(function() {
        // replace with http://stackoverflow.com/questions/1601151/how-do-i-check-in-sqlite-whether-a-table-exists or like
        db.run("CREATE TABLE test (unsanitized TEXT, sanitized TEXT)",function(err) {
          // don't care about errors here, atm.
        });
        db.run("INSERT INTO test VALUES (?, ?)", [rawData, sanitizedData], function(err) {
          if(err!=null) { return callback(err); }
          callback(null, db);
        });
      });
    },
    // get our new row number
    function(db, callback) {
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
