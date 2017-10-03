const config = require("../server/routes/config");
const isReachable = require("is-reachable");
const brambleServer = config.editorHOST;
const colors = require("colors");

isReachable(brambleServer).then(reachable => {
  if (!reachable) {
    console.warn(
      colors.yellow(
        `Error: Bramble server is not running. Please end this process and run the Brackets server with: npm start`
      )
    );
  }
});
