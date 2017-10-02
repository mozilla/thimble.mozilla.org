const config = require('server/routes/config');

const isReachable = require('is-reachable');
var brambleServer = config.editorHOST;

console.log("Checking for Bramble Server. " + brambleServer);

isReachable(brambleServer).then(reachable => {
  
  if(reachable)
  {
    console.log("Bramble server is running.");    
  }
  else
  {
    console.log("Error: Bramble server is not running. Please end this process and run the Brackets server with: npm start");
  }
});
