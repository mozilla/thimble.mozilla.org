/**
 * This code ensures the "publish" button is only
 * visible when the user is logged in according
 * the persona SSO that we employ for webmaker.org
 */
(function() {
  var hostname = document.getElementById("ssooverride").getAttribute("data-login-hostname");
  var loginToSave = document.getElementById("ssooverride").getAttribute("data-login-to-save");

  require(["jquery", "thimblePage"], function($, editor) {

    // we chronicle login status with a "loggedin" class on the <html> tag
    var html = document.getElementsByTagName("html")[0];

    function displayLogin(userData) {
      var userElement = $( "div.user" );
      var placeHolder = $( "#identity" );
      var html = document.querySelector( "html" );
      var lang = html && html.lang ? html.lang : "en-US"

      if (userData) {
        placeHolder.html('<a href="' + hostname + '/' + lang + '/account">' + userData.username + "</a>");
        placeHolder.parent().children('img').attr('src', userData.avatar);
        userElement.show();
      } else {
        placeHolder.text("");
        userElement.hide();
      }
    }

    /**
     * This kicks in when Friendlycode is well and truly done building itself.
     */
    editor.ready.done(function() {
      var userfield = $("#identity");
      var buttons = $('.save-button, .publish-button');
      var saveButton = $('.save-button');
      var loginButtonSpan = $("#webmaker-nav .signin-button");
      var logoutButtonSpan = $("#webmaker-nav .logoutbutton");

      function enable(user) {
        loginButtonSpan.addClass("hidden");
        logoutButtonSpan.removeClass("hidden");
        buttons.attr("disabled", false).attr("title", '');
        displayLogin(user);
        html.classList.add("loggedin");
      };

      function disable() {
        loginButtonSpan.removeClass("hidden");
        logoutButtonSpan.addClass("hidden");
        displayLogin();
        buttons.attr("disabled", true);
        saveButton.attr("title", loginToSave);
        html.classList.remove("loggedin");
      }

      var csrf = document.getElementById("ssooverride").getAttribute("data-csrf");
      var createEl = document.querySelector('#webmaker-nav .join-button');
      var loginEl = document.querySelector('#webmaker-nav .signin-button');
      var logoutEl = document.querySelector('#webmaker-nav .logoutbutton');

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

      createEl.addEventListener('click', function() {
        thimbleAuth.create();
      });
      loginEl.addEventListener('click', function() {
        thimbleAuth.login();
      });
      logoutEl.addEventListener('click', function() {
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
