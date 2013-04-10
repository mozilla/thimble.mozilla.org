/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

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

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


// HACKASAURUS API IMPLEMENTATION

app.get("/remix", function(request, response) {
  // this does nothing for us, since we publish to AWS.
  // any link that we get in /publish will point to an AWS
  // location, so we're not serving saved content from this app.
  // we only publish through it, and load up templated pages,
  // such as the default, and learning_projects (which can come
  // later. This is P.O.C.)
});

app.post('/publish', function(request, response) {
  // .. stub for POST operation

/*
  1) get data from request
  2) try to bleach it through http://htmlsanitizer.org/
  3) if we succeeded in bleaching, we save that data to AWS

  3b) for P.O.C., we're actually just going to say "hurray it worked" for now
*/
});
