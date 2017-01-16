var fs = require('fs');
var http = require('http');
var finalHandler = require('finalhandler');
var serveStatic = require('serve-static');

var port = process.env.PORT || '4444';
var host = process.env.HOST || '127.0.0.1';

var serve = serveStatic(__dirname, { 'index': ['tests/runner.html'] });

http.createServer(function (req, res) {
  var done = finalHandler(req, res);
  serve(req, res, done);
}).listen(port, host);

var f = fs.readFileSync(__dirname + '/help.txt', 'utf8');
console.log(f.replace('{{host}}', host).replace('{{port}}', port));
console.log('Server running %s:%d...', host, port);
