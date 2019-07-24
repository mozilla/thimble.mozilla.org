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
const editorDomain = `${editorHOST.protocol}//${editorHOST.host}`;
editorHOST = `${editorDomain}${editorHOST.pathname}`.replace(/\/$/, "");

const homepageVideoLink = "https://www.youtube.com/embed/JecFOjD9I3k";

module.exports = {
  appURL: env.get("APP_HOSTNAME"),
  oauth: oauth,
  loginURL: loginURL,
  logoutURL: logoutURL,
  publishURL: env.get("PUBLISH_HOSTNAME"),
  publishedProjectsHostname: env.get("PUBLISHED_PROJECTS_HOSTNAME"),
  glitch: {
    exportEnabled: env.get("GLITCH_EXPORT_ENABLED"),
    migrationDate: env.get("GLITCH_MIGRATION_DATE"),
    moreInfoURL: env.get("GLITCH_HOMEPAGE_DIALOG_BLOG_POST"),
    supportEmail: env.get("GLITCH_SUPPORT_EMAIL"),
    importURL: env.get("GLITCH_IMPORT_PROJECT_APP_URL"),
    roadmapDate1: env.get("GLITCH_ROADMAP_DATE_1"),
    roadmapDate2: env.get("GLITCH_ROADMAP_DATE_2"),
    roadmapDate3: env.get("GLITCH_ROADMAP_DATE_3")
  },
  editorHOST: editorHOST,
  editorURL:
    env.get("NODE_ENV") === "development"
      ? env.get("BRAMBLE_URI") + "/src"
      : env.get("BRAMBLE_URI") + "/dist",
  cryptr: new Cryptr(env.get("SESSION_SECRET")),
  DEFAULT_PROJECT_TITLE: env.get("DEFAULT_PROJECT_TITLE"),
  // One of "tarball" (default) or "files" to specify how projects should get loaded.
  projectLoadStrategy:
    env.get("PROJECT_LOAD_STRATEGY") === "files" ? "files" : "tarball",
  csp: {
    defaultSrc: [editorDomain],
    frameSrc: [editorDomain, homepageVideoLink],
    childSrc: [editorDomain, homepageVideoLink],
    scriptSrc: [editorDomain],
    connectSrc: [editorDomain]
  },
  shutdownNewAccounts: env.get("SHUTDOWN_NEW_ACCOUNTS", false),
  shutdownNewProjectsAndPublishing: env.get(
    "SHUTDOWN_NEW_PROJECTS_AND_PUBLISHING",
    false
  )
};
