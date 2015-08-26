/**
 * This code ensures the "publish" button is only
 * visible when the user is logged in according
 * the persona SSO that we employ for webmaker.org
 */
define(function(require) {
  var $ = require("jquery");
  var uuid = require("uuid");
  var cookies = require("cookies");
  var Project = require("project");

  function init() {
    var loginUrl = $("#publish-ssooverride").attr("data-loginUrl");
    var joinEl = $('#signup-link');
    var loginEl = $('#login-link');

    function signIn(newUser) {
      return function(e) {
        e.preventDefault();

        cookies.expire("state");
        cookies.set("state", uuid.v4());

        var location = loginUrl;
        location += "?now=" + (new Date()).toISOString();

        if (newUser) {
          location += "&signup=true";
        }

        if (Project.getAnonymousId()) {
          location += "&anonymousId=" + Project.getAnonymousId();
        }

        window.location = location;
      };
    }

    // Signup login flow
    joinEl.on('click', signIn(true));

    // Login flow
    loginEl.on('click', signIn());
  }

  return {
    init: init
  };
});
