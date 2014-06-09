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
      var userElement = $( "div.user" ),
          placeHolder = $( "#identity" ),
          html = document.querySelector( "html" );
          lang = html && html.lang ? html.lang : "en-US",
          loginButtonSpan = $("#webmaker-nav .loginbutton"),
          logoutButtonSpan = $("#webmaker-nav .logoutbutton");

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
      var userfield = $("#identity"),
          buttons = $('.save-button, .publish-button'),
          saveButton = $('.save-button');

      function enable(user) {
        buttons.attr("disabled", false).attr("title", '');
        displayLogin(user);
        html.classList.add("loggedin");
      };

      function disable() {
        displayLogin();
        buttons.attr("disabled", true);
        saveButton.attr("title", loginToSave);
        html.classList.remove("loggedin");
      }

      // Attach event listeners!
      thimbleAuth.on('login', function(user, debuggingInfo) {
        enable(user);
        loginButtonSpan.addClass("hidden");
        logoutButtonSpan.removeClass("hidden");
      });

      thimbleAuth.on('logout', function() {
        disable();
        loginButtonSpan.removeClass("hidden");
        logoutButtonSpan.addClass("hidden");
      });

      disable();
      thimbleAuth.verify();
    });
  });
}());
