/**
 * This code ensures the "publish" button is only
 * visible when the user is logged in according
 * the persona SSO that we employ for webmaker.org
 */
define(["jquery", "uuid", "cookies"], function($, uuid, cookies) {
  var loginUrl = $("#publish-ssooverride").attr("data-loginUrl");

  var joinEl = $('#signup-link');
  var loginEl = $('#login-link');

  function signIn(newUser) {
    return function(e) {
      e.preventDefault();

      cookies.expire("state");
      cookies.set("state", uuid.v4());

      window.location = loginUrl + (newUser ? "?signup=true" : "");
    };
  }

  // Signup login flow
  joinEl.on('click', signIn(true));

  // Login flow
  loginEl.on('click', signIn());
});
