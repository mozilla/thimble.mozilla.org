var env = require("../lib/environment");
var url = require("url");
var Cryptr = require("cryptr");

// We make sure to grab just the protocol and hostname for
// postmessage security.
var editorHOST = url.parse(env.get("BRAMBLE_URI"));
editorHOST = editorHOST.protocol +"//"+ editorHOST.host + editorHOST.pathname;

module.exports = {
  appURL: env.get("APP_HOSTNAME"),
  webmaker: env.get("WEBMAKER_URL"),
  oauth: env.get("OAUTH"),
  publishURL: env.get("PUBLISH_HOSTNAME"),
  editorHOST: editorHOST,
  editorURL: env.get("NODE_ENV") === "development" ? env.get("BRAMBLE_URI") + "/src" : env.get("BRAMBLE_URI") + "/dist",
  cryptr: new Cryptr(env.get("SESSION_SECRET"))
};
