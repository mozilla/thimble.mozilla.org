/* jshint newcap:false */
var habitat = require("habitat");
habitat.load(require("path").resolve(__dirname, "../../.env"));
var env = new habitat();

module.exports = env;
