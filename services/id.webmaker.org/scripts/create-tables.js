var spawn = require('cross-spawn');

var create = spawn('psql', ['-d','webmaker_oauth_test', '-f', 'scripts/create-tables.sql'], {
  stdio: 'inherit'
});

create.on('close', function(code) {
  process.exit(code);
});
