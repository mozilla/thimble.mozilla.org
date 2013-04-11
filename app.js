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
    nunjucksEnv;

var ALLOWED_TAGS = [
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
      // TODO: We should probably add to this. What meta attributes can't
      // be abused for SEO purposes?
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

app.get('/', function(request, response) {
  response.render('index.html');
});

app.get('/projects/:name', function(request, response) {
  var tpl = nunjucksEnv.getTemplate('learning_projects/' + request.params.name + '.html' );
  var content = tpl.render({HTTP_STATIC_URL: '/learning_projects/'}).replace(/'/g, '\\\'').replace(/\n/g, '\\n');
  response.render('index.html', {template: content, HTTP_STATIC_URL: '/'});
});

app.get('/users', user.list);

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

app.post('/publish', function(request, response) {
  console.error("FUNCTION HIT");
  console.error(request.body);
  /*
    1) get data from request
    2) try to bleach it through http://htmlsanitizer.org/
    3) if we succeeded in bleaching, we save that data to AWS

    3b) for P.O.C., we're actually just going to say "hurray it worked" for now
  */
    var data = ( request.body.html ? request.body.html : "" );
    sanitize({
      url: 'http://htmlsanitizer.org',
      text: data,
      tags: ALLOWED_TAGS,
      attributes: ALLOWED_ATTRS,
      styles: [],
      strip: false,
      strip_comments: false
    },
    // response callback
    function(err, sanitized) {
      // At this point, we have a sanitized, and raw unsanitized
      // data in "sanitized" and "buffer", respectively. We can now
      // push this to AWS or wherever else we want
      if(err) { response.end(); }
      else {
        var jsonRespose = { 'published-url' : 'http://mozilla.org/1' };
        response.json(jsonRespose);
        response.end();
      }
    });

});
