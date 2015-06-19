var env = require("../lib/environment");
var url = require("url");
var Cryptr = require("cryptr");

// We make sure to grab just the protocol and hostname for
// postmessage security.
var editorHOST = url.parse(env.get("BRAMBLE_URI"));
editorHOST = editorHOST.protocol +"//"+ editorHOST.host + editorHOST.pathname;

function authorized(req, res) {
  if(!req.session.user) {
    // TODO: handle error
    console.error('Unauthorized request');
    res.send(401);
    return false;
  }

  if(!req.session.project || !req.session.project.meta) {
    // TODO: handle error
    console.error('No project information available for the user');
    res.send(404);
    return false;
  }

  return true;
}

module.exports = {
  allowJS: env.get("JAVASCRIPT_ENABLED", false),
  appURL: env.get("APP_HOSTNAME"),
  personaHost: env.get("PERSONA_HOST"),
  makeEndpoint: env.get("MAKE_ENDPOINT"),
  previewLoader: env.get("PREVIEW_LOADER"),
  together: env.get("USE_TOGETHERJS") ? env.get("TOGETHERJS") : false,
  userbarEndpoint: env.get("USERBAR"),
  webmaker: env.get("WEBMAKER_URL"),
  loginURL: env.get("LOGIN_URL"),
  oauth: env.get("OAUTH"),
  publishURL: env.get("PUBLISH_HOSTNAME"),
  editorHOST: editorHOST,
  editorURL: env.get("NODE_ENV") === "development" ? env.get("BRAMBLE_URI") + "/src" : env.get("BRAMBLE_URI") + "/dist",
  cryptr: new Cryptr(env.get("SESSION_SECRET")),
  authorized: authorized
};
