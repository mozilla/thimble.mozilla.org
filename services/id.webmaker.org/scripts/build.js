var spawn = require('cross-spawn');

var buildCommand;

if ( process.env.NPM_CONFIG_PRODUCTION === 'true' ) {
  buildCommand = 'build:production';
} else {
  buildCommand = 'build';
}

var npm = spawn('npm', ['run', buildCommand], {
  stdio: 'inherit'
});

npm.on('close', function(code) {
  process.exit(code);
});
