/**
 * This code ensures the "publish" button is only
 * visible when the user is logged in according
 * the persona SSO that we employ for webmaker.org
 */
(function() {
  var hostname = document.getElementById("ssooverride").getAttribute("data-login-hostname");
  var loginToSave = document.getElementById("ssooverride").getAttribute("data-login-to-save");

  // XXXNew Thimble
  // As soon as the page has loaded it, we attach listeners to hide the
  // "new thimble" bar:
  var closeBannerButton = document.getElementById("new-thimble-banner");
  function hideBanner(e) {
    e.preventDefault();
    e.stopPropagation();

    var body = document.querySelector("body");
    body.classList.remove("has-notice");

    closeBannerButton.classList.add("hide");
    closeBannerButton.removeEventListener("click", hideBanner, false);
  }
  closeBannerButton.addEventListener("click", hideBanner, false);

  require(["jquery", "thimblePage", "url-template"], function($, editor, urlTemplate) {

    // we chronicle login status with a "loggedin" class on the <html> tag
    var html = document.getElementsByTagName("html")[0];

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
      var adminEl = userInfoDropdown.find('span[data-admin]');
      var supermentorEl = userInfoDropdown.find('span[data-supermentor]');
      var mentorEl = userInfoDropdown.find('span[data-mentor]');
      var profileEl = userInfoDropdown.find('a[data-profile]');

      function enable(user) {
        joinEl.addClass("hidden");
        loginEl.addClass("hidden");

        avatarEl.attr("src", user.avatar);
        usernameEl.text(user.username);
        if (user.isAdmin) {
          adminEl.removeClass("hidden");
          supermentorEl.addClass("hidden");
          mentorEl.addClass("hidden");
        } else if (user.isSuperMentor) {
          adminEl.addClass("hidden");
          supermentorEl.removeClass("hidden");
          mentorEl.addClass("hidden");
        } else if (user.isMentor) {
          adminEl.addClass("hidden");
          supermentorEl.addClass("hidden");
          mentorEl.removeClass("hidden");
        } else {
          adminEl.addClass("hidden");
          supermentorEl.addClass("hidden");
          mentorEl.addClass("hidden");
        }
        profileEl.attr("href", urlTemplate.parse(profileEl.attr("data-href-template")).expand(user));

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

      var thimbleAuth = new WebmakerLogin({
        csrfToken: csrf,
        showCTA: false
      });

      joinEl.on('click', function() {
        thimbleAuth.create();
      });
      loginEl.on('click', function() {
        thimbleAuth.login();
      });
      logoutEl.on('click', function() {
        thimbleAuth.logout();
      });

      // Attach event listeners!
      thimbleAuth.on('login', enable);
      thimbleAuth.on('logout', disable);
      thimbleAuth.on('verified', function(user) {
        if (user) {
          enable(user);
        } else {
          disable();
        }
      });

      // Default state is signed-out
      disable();
    });
  });
}());
