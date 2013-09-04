#! /usr/local/bin/node

var express = require('express'),
    app = express.createServer(express.logger()),
    port = 8005,
    dirname = process.cwd();

if (process.argv[2] && process.argv[2].match(/^[0-9]+$/))
  port = parseInt(process.argv[2]);

app.use(express.static(dirname));

app.listen(port, function() {
  console.log("serving on port " + port + " files in " + dirname);
});
