 requirejs.config({
    baseUrl: "/js",
    paths: {
      "analytics": "/bower/webmaker-analytics/analytics",
      "jquery": "/bower/jquery/jquery.min",
      "list": "/bower/listjs/dist/list.min",
      "fuzzySearch": "/bower/list.fuzzysearch.js/dist/list.fuzzysearch.min",
      "text": "/bower/text/text",
      "selectize": "../bower/selectize/dist/js/standalone/selectize.min"
    }
  });
  require([ "jquery", "selectize"], function ($, selectize) {
    var csrf_token = $( "meta[name='csrf-token']" ).attr( "content" );

    var webmakerLogin = new WebmakerLogin({
      csrfToken: csrf_token,
      showCTA: true
    });

    // CRSF Protection
    $.ajaxSetup({
      beforeSend: function( request ) {
       request.setRequestHeader( "X-CSRF-Token", csrf_token ); // express.js uses a non-standard name for csrf-token
      }
    });

    var signupEl = $('.join-webmaker');
    var loginEl = $('.webmaker-signin');
    var logoutEl = $('.webmaker-logout');
    var userInfoEl = $('.user');
    var passwordLoginUsed = false;

    $( ".set-password-failed" ).hide();
    $( ".remove-password-failed" ).hide();

    function toggleUserData(userData) {
      var placeHolder = $('#identity');
      var userElement = $('div.user-name');
      var lang = $('html').attr('lang') || 'en-US';

      if (userData) {
        placeHolder.html('<img src="' + userData.avatar + '" alt="">' +
          '<a href="/' + lang + '/account">' + userData.username + "</a>");
      } else {
        userElement.html('<span id="identity"></span>');
      }
    }

    function showPasswordLoginUI() {
      if ( passwordLoginUsed ) {
        return;
      }
      passwordLoginUsed = true;
      $( ".webmaker-login-message" ).hide();
      $( ".webmaker-login-subtext" ).hide();
      $( ".set-password" ).hide();
      $( ".create-password-form" ).hide();

      $( ".custom-password-message" ).fadeIn();
      $( ".password-login-subtext" ).fadeIn();
      $( ".disable-password" ).fadeIn();
    }

    function showWebmakerLoginUI() {
      if ( !passwordLoginUsed ) {
        return;
      }
      passwordLoginUsed = false;
      $( ".custom-password-message" ).hide();
      $( ".password-login-subtext" ).hide();
      $( ".disable-password" ).hide();
      $( ".create-password-form" ).hide();

      $( ".webmaker-login-message" ).fadeIn();
      $( ".webmaker-login-subtext" ).fadeIn();
      $( ".set-password" ).fadeIn();
    }

    showPasswordLoginUI();

    function onLogin( user ) {
      $('#webmaker-nav').addClass('loggedin');
      toggleUserData(user);
      signupEl.hide();
      loginEl.hide();
      userInfoEl.show();
      logoutEl.removeClass('hidden');

      $( "#logout-message" ).hide();
      $( ".wm-logged-out-panel" ).hide();
      $( ".wm-user-panel" ).fadeIn();
      $( ".wm-email" ).text( user.email );
      $( ".wm-page").html( '<a href="//' + user.username + "{{ profile }}" +'">' + user.username + "{{ profile }}" + '</a>');
      $( ".wm-username" ).text( user.username );
      $( "#user-avatar" ).css( "background-image", "url(https://secure.gravatar.com/avatar/" + user.emailHash + "?s=200&d=https%3A%2F%2Fstuff.webmaker.org%2Favatars%2Fwebmaker-avatar-200x200.png)" );

      $( "#sendEventCreationEmailsCheckbox" ).prop( "checked", user.sendEventCreationEmails );
      $( "#sendMentorRequestEmailsCheckbox" ).prop( "checked", user.sendMentorRequestEmails );
      $( "#sendCoorganizerNotificationEmailsCheckbox" ).prop( "checked", user.sendCoorganizerNotificationEmails );

      $.ajax({
        type: "POST",
        url: "/auth/v2/uid-exists",
        data: JSON.stringify({
          uid: user.email
        }),
        contentType: "application/json",
        success: function(data) {
          if ( data.usePasswordLogin ) {
            showPasswordLoginUI();
          } else {
            showWebmakerLoginUI();
          }
        }
      });
    }

    function onLogout() {
      $('#webmaker-nav').removeClass('loggedin');
      toggleUserData();
      signupEl.show();
      loginEl.show();
      userInfoEl.hide();
      logoutEl.addClass('hidden');
      $( ".wm-user-panel" ).hide();
      $( ".wm-logged-out-panel" ).fadeIn();
      $( "#confirm-delete" ).hide();
    }

    webmakerLogin.on( "login", onLogin );
    webmakerLogin.on( "logout", onLogout );
    webmakerLogin.on( "verified", function(user) {
      if (user) {
        onLogin(user);
      } else {
        onLogout();
      }
    });

    signupEl.click(function() {
      webmakerLogin.create();
    });
    loginEl.click(function() {
      webmakerLogin.login();
    });
    logoutEl.click(function() {
      webmakerLogin.logout();
    });

    $( "#delete-account" ).click(function( e ){
      e.preventDefault();
      $( "#confirm-delete" ).fadeIn();
    });
    $( "#delete-me" ).click(function( e ){
      if ( $( "#email-check" ).val() === $( ".wm-email" ).text() ) {
        $.post( "/account/delete", function( data ) {
          if ( !data.error ) {
            webmakerLogin.on( "logout", function onDelete() {
              setTimeout(function() {
                window.location.href = "{{ WEBMAKERORG }}?userDel=1";
              }, 1000);
            });
            webmakerLogin.logout();
          }
        });
      } else {
        $( "#wrong-email" ).fadeIn();
        setTimeout(function() {
          $( "#wrong-email" ).fadeOut();
        }, 3000);
      }
    });

    // The button to close the confirm-delete box
    $( "#boxclose" ).click(function() {
      $( "#confirm-delete" ).fadeOut();
    });

    $( "#sendEventCreationEmailsCheckbox" ).change(function(e) {
      var checked = $( this ).prop( "checked" ) ? true : false;

      $.ajax({
        type: "PUT",
        url: "/account/update",
        data: JSON.stringify({
          sendEventCreationEmails: checked
        }),
        contentType: "application/json",
        success: function( data, textStatus ) {
          $( ".email-prefs.prefs-saved" ).fadeIn().delay( 1000 ).fadeOut();
        },
        error: function( jqXHR, textStatus, errorThrown ) {
          $( ".email-prefs.prefs-error" ).fadeIn().delay( 1000 ).fadeOut();
        }
      });
    });

    $( "#sendMentorRequestEmailsCheckbox" ).change(function(e) {
      var checked = $( this ).prop( "checked" ) ? true : false;

      $.ajax({
        type: "PUT",
        url: "/account/update",
        data: JSON.stringify({
          sendMentorRequestEmails: checked
        }),
        contentType: "application/json",
        success: function( data, textStatus ) {
          $( ".email-prefs.prefs-saved" ).fadeIn().delay( 1000 ).fadeOut();
        },
        error: function( jqXHR, textStatus, errorThrown ) {
          $( ".email-prefs.prefs-error" ).fadeIn().delay( 1000 ).fadeOut();
        }
      });
    });

    $( "#sendCoorganizerNotificationEmailsCheckbox" ).change(function(e) {
      var checked = $( this ).prop( "checked" ) ? true : false;

      $.ajax({
        type: "PUT",
        url: "/account/update",
        data: JSON.stringify({
          sendCoorganizerNotificationEmails: checked
        }),
        contentType: "application/json",
        success: function( data, textStatus ) {
          $( ".email-prefs.prefs-saved" ).fadeIn().delay( 1000 ).fadeOut();
        },
        error: function( jqXHR, textStatus, errorThrown ) {
          $( ".email-prefs.prefs-error" ).fadeIn().delay( 1000 ).fadeOut();
        }
      });
    });

    $( ".set-password" ).click(function(e) {
      e.preventDefault();
      $( ".create-password-form" ).fadeIn();
    });

    var passInput = $( ".password-input-main" ),
        confirmInput = $( ".password-input-confirm" ),
        setPasswordBtn = $( ".set-password-button" );

    function validatePassword(blurEvent) {
      if ( confirmInput.val() !== passInput.val() ) {
        setPasswordBtn.prop("disabled", true);
      } else {
        setPasswordBtn.prop("disabled", false);
      }
    }

    confirmInput.on( "input", function() {
      validatePassword(true);
    });

    var tooShort = $( "#too-short" ),
        tooLong = $( "#too-long" ),
        charClasses = $( "#char-classes" ),
        commonPassword = $( "#common-password" );

    function processPasswordStrengthFailedTests(results) {
      var failedTests = results.failedTests;

      if ( failedTests.indexOf(0) !== -1 ) {
        tooShort.show();
      } else {
        tooShort.hide();
      }

      if ( failedTests.indexOf(1) !== -1 ) {
        tooLong.show();
      } else {
        tooLong.hide();
      }

      if ( failedTests.indexOf(3) !== -1 ) {
        commonPassword.show();
      } else {
        commonPassword.hide();
      }

      if ( results.optionalTestsPassed < 2 ) {
        charClasses.show();
      } else {
        charClasses.hide();
      }
    }

    setPasswordBtn.click(function(e) {
      var password = $( ".password-input-main" ).val();

      // use localized confirmation message
      var confirm = window.confirm($( "input[name=confirmSetPassword]" ).val());

      if ( confirm ) {
        $.ajax({
          type: "POST",
          url: "/auth/v2/enable-passwords",
          data: JSON.stringify({
            password: password
          }),
          contentType: "application/json",
          success: function() {
            $( ".set-password-failed" ).hide();
            showPasswordLoginUI();
          },
          error: function(resp) {
            if ( resp.responseJSON && resp.responseJSON.strong === false ) {
              processPasswordStrengthFailedTests(resp.responseJSON);
              $( ".set-password-failed" ).fadeIn();
            }
            setPasswordBtn.prop("disabled", false);
          }
        });
      } else {
        showWebmakerLoginUI();
      }
    });

    $( ".disable-password" ).click(function(e) {
      // use localized confirmation message
      var confirm = window.confirm($( "input[name=confirmDeletePassword]" ).attr("value"));

      if ( confirm ) {
        $.ajax({
          type: "POST",
          url: "/auth/v2/remove-password",
          contentType: "application/json",
          success: function() {
            $( ".remove-password-failed" ).hide();
            showPasswordLoginUI();
          },
          error: function() {
            $( ".remove-password-failed" ).fadeIn();
          }
        });
      } else {
        showPasswordLoginUI();
      }
    });

    $("#languagePref").selectize({
        onChange: function(value) {
          $.ajax({
            type: "PUT",
            url: "/account/update",
            data: {
              prefLocale: value
            },
            success: function( data, textStatus ) {
              Languages.langRedirector(value);
            },
            error: function( jqXHR, textStatus, errorThrown ) {
              $( ".email-prefs.prefs-error" ).fadeIn().delay( 1000 ).fadeOut();
            }
          });
        }
    });
  });
