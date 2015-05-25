/**
 * This code ensures the "publish" button is only
 * visible when the user is logged in according
 * the persona SSO that we employ for webmaker.org
 */
(function() {
  var overrideElement = document.getElementById("ssooverride");
  var authHostname = overrideElement.getAttribute("data-login-authHostname");
  var thimbleHostname = overrideElement.getAttribute("data-login-thimbleHostname");
  var loginToSave = overrideElement.getAttribute("data-login-to-save");
  var oauthClientId = overrideElement.getAttribute("data-oauth-clientid");

  var user = {
    username: document.getElementById("ssooverride").getAttribute("data-oauth-username"),
    avatar: document.getElementById("ssooverride").getAttribute("data-oauth-avatar")
  };

  require(["jquery", "thimblePage", "url-template", "uuid", "cookies"], function($, editor, urlTemplate, uuid, cookies) {
    // we chronicle login status with a "loggedin" class on the <html> tag
    var html = document.getElementsByTagName("html")[0];

    function setStateCookie(state) {
      var domain;

      cookies.expire("state");
      cookies.set("state", state);
    }

    /**
     * This kicks in when Friendlycode is well and truly done building itself.
     */
    editor.ready.done(function() {
      var userfield = $("#identity");
      var buttons = $('.save-button, .publish-button');
      var saveButton = $('.save-button');
      var csrf = document.getElementById("ssooverride").getAttribute("data-csrf");
      var joinEl = $('#webmaker-nav .join-button');
      var loginEl = $('#webmaker-nav .signin-button');
      var logoutEl = $('#webmaker-nav .logout-button');
      var userInfoDropdown = $('#webmaker-nav .user-info-dropdown');
      var avatarEl = userInfoDropdown.find('img[data-avatar]');
      var usernameEl = userInfoDropdown.find('strong[data-username]');

      function enable(user) {
        joinEl.addClass("hidden");
        loginEl.addClass("hidden");

        avatarEl.attr("src", user.avatar);
        usernameEl.text(user.username);

        userInfoDropdown.removeClass("hidden");
        buttons.attr("disabled", false).attr("title", '');
        html.classList.add("loggedin");
      };

      function disable() {
        joinEl.removeClass("hidden");
        loginEl.removeClass("hidden");
        userInfoDropdown.addClass("hidden");
        buttons.attr("disabled", true);
        saveButton.attr("title", loginToSave);
        html.classList.remove("loggedin");
      }

      $('.dropdown').each(function (index, el) {
        var dropDownMenu = el.querySelector('.dropdown-menu');
        var dropDownToggle = el.querySelector('.dropdown-toggle');
        dropDownToggle.addEventListener('click', function (e) {
          e.preventDefault();
          if (dropDownMenu.style.display === 'block') {
            dropDownMenu.style.display = '';
          } else {
            dropDownMenu.style.display = 'block';
          }
        }, false);
      });

      var basicQuery = "?" + [
        "client_id=" + oauthClientId,
        "response_type=code",
        "scopes=user email"
      ].join("&");

      // Signup login flow
      joinEl.on('click', function() {
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
      loginEl.on('click', function() {
        var state = uuid.v4();
        var oauthRoute = "/login/oauth/authorize";

        var query = authHostname + oauthRoute + basicQuery + [
          "&state=" + state,
          "action=signin"
        ].join("&");

        setStateCookie(state);

        window.location = query;
      });
      logoutEl.on('click', function() {
        // Logout flow
        var oauthRoute = "/logout";

        var query = authHostname + oauthRoute + "?client_id=" + oauthClientId;

        window.location = query;
      });

      if (user.username.length > 0) {
        enable(user);
      } else {
        // We disable the publishing UI by default
        disable();
      }
    });
  });
}());
