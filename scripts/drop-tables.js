var spawn = require('cross-spawn');

var drop = spawn('psql', ['-d', 'webmaker_oauth_test', '-f', 'scripts/drop-tables.sql'], {
  stdio: 'inherit'
});

drop.on('close', function(code) {
  process.exit(code);
});
