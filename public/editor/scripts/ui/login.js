/* globals $: true */
/**
 * This code ensures the "publish" button is only
 * visible when the user is logged in according
 * the persona SSO that we employ for webmaker.org
 */
var $ = require("jquery");
var uuid = require("uuid");
var cookies = require("cookies-js");

var Project = require("../project");

function init() {
  var loginUrl = $("#publish-ssooverride").attr("data-loginUrl");
  var joinEl = $("#signup-link");
  var loginEl = $("#login-link");
  var bramble;

  // If we're running in the context of the Bramble editor/instance
  // get a reference to it as soon as it becomes available, so that
  // we can save files before we navigate away for sign-in.
  if (window.Bramble) {
    window.Bramble.once("ready", function(brambleInstance) {
      bramble = brambleInstance;
    });
  }

  function signIn(newUser) {
    return function(e) {
      e.preventDefault();

      cookies.expire("state");
      cookies.set("state", uuid.v4());

      var location = loginUrl;
      location += "?now=" + new Date().toISOString();

      if (newUser) {
        location += "&signup=true";
      }

      if (Project.getAnonymousId()) {
        location += "&anonymousId=" + Project.getAnonymousId();
      }

      function navigate() {
        window.location = location;
      }

      if (bramble) {
        bramble.saveAll(navigate);
      } else {
        navigate();
      }
    };
  }

  // Signup login flow
  joinEl.on("click", signIn(true));

  // Login flow
  loginEl.on("click", signIn());
}

module.exports = {
  init: init
};
