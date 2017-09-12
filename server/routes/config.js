var url = require("url");
var Cryptr = require("cryptr");

var env = require("../lib/environment");
var oauth = env.get("OAUTH");
var loginURL =
  oauth.authorization_url +
  "/login/oauth/authorize?" +
  [
    "client_id=" + oauth.client_id,
    "response_type=code",
    "scopes=user email"
  ].join("&");
var logoutURL =
  oauth.authorization_url + "/logout?client_id=" + oauth.client_id;

// We make sure to grab just the protocol and hostname for
// postmessage security.
var editorHOST = url.parse(env.get("BRAMBLE_URI"));
editorHOST = editorHOST.protocol + "//" + editorHOST.host + editorHOST.pathname;

module.exports = {
  appURL: env.get("APP_HOSTNAME"),
  oauth: oauth,
  loginURL: loginURL,
  logoutURL: logoutURL,
  publishURL: env.get("PUBLISH_HOSTNAME"),
  publishedProjectsHostname: env.get("PUBLISHED_PROJECTS_HOSTNAME"),
  editorHOST: editorHOST,
  editorURL:
    env.get("NODE_ENV") === "development"
      ? env.get("BRAMBLE_URI") + "/src"
      : env.get("BRAMBLE_URI") + "/dist",
  cryptr: new Cryptr(env.get("SESSION_SECRET")),
  DEFAULT_PROJECT_TITLE: env.get("DEFAULT_PROJECT_TITLE"),
  // One of "tarball" (default) or "files" to specify how projects should get loaded.
  projectLoadStrategy:
    env.get("PROJECT_LOAD_STRATEGY") === "files" ? "files" : "tarball"
};
