const config = require('../server/routes/config');

const isReachable = require('is-reachable');
var brambleServer = config.editorHOST;


isReachable(brambleServer).then(reachable => {
  
  if(!reachable) {
    console.warn("Error: Bramble server is not running. Please end this process and run the Brackets server with: npm start");
  }
});
