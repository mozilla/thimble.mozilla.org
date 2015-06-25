/**
 * This code ensures the "publish" button is only
 * visible when the user is logged in according
 * the persona SSO that we employ for webmaker.org
 */
(function() {
  var overrideElement = document.getElementById("ssooverride");
  var authHostname = overrideElement.getAttribute("data-login-authHostname");
  var oauthClientId = overrideElement.getAttribute("data-oauth-clientid");

  var user = {
    username: document.getElementById("ssooverride").getAttribute("data-oauth-username"),
    avatar: document.getElementById("ssooverride").getAttribute("data-oauth-avatar")
  };

  require(["jquery", "uuid", "cookies", "thimblePage"], function($, uuid, cookies) {
    function setStateCookie(state) {
      cookies.expire("state");
      cookies.set("state", state);
    }

    var joinEl = $('#signup-link');
    var loginEl = $('#login-link');
    var logoutEl = $('#logout-link');

    var basicQuery = "?" + [
      "client_id=" + oauthClientId,
      "response_type=code",
      "scopes=user email"
    ].join("&");

    // Signup login flow
    joinEl.on('click', function(e) {
      e.preventDefault();

      var state = uuid.v4();
      var oauthRoute = "/login/oauth/authorize";

      var query = authHostname + oauthRoute + basicQuery + [
        "&state=" + state,
        "action=signup"
      ].join("&");

      setStateCookie(state);

      window.location = query;
    });
    // Login flow
    loginEl.on('click', function(e) {
      e.preventDefault();

      var state = uuid.v4();
      var oauthRoute = "/login/oauth/authorize";

      var query = authHostname + oauthRoute + basicQuery + [
        "&state=" + state,
        "action=signin"
      ].join("&");

      setStateCookie(state);

      window.location = query;
    });

    logoutEl.on('click', function(e) {
      e.preventDefault();

      var oauthRoute = "/logout";
      var query = authHostname + oauthRoute + "?client_id=" + oauthClientId;

      window.location = query;
    });
  });
}());
