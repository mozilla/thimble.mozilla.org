const config = require("../server/routes/config");
const isReachable = require("is-reachable");
const brambleServer = config.editorHOST;
const colors = require("colors");

isReachable(brambleServer).then(reachable => {
  if (!reachable) {
    console.warn(
      colors.yellow(
        `Error: Brackets is not running. In a separate terminal window, run Brackets using npm start in the brackets folder.`
      )
    );
  }
});
