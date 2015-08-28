// Because we pre-load require scripts needed by the editor, we need to
// eat error messages related to fetching but not using those modules.
requirejs.onError = function(err) {
  if(err.requireType !== "mismatch") {
    throw err;
  }
};

require.config({
  baseUrl: "/homepage/scripts",
  paths: {
    "jquery": "/bower/jquery/index",
    "localized": "/bower/webmaker-i18n/localized",
    "uuid": "/bower/node-uuid/uuid",
    "cookies": "/bower/cookies-js/dist/cookies"
  },
  shim: {
    "jquery": {
      exports: "$"
    }
  }
});

// While the user is reading this page, start to cache Bramble's biggest files
function preloadBramble($) {
  var brambleHost = $("meta[name='bramble-host']").attr("content");
  [
    brambleHost + "/dist/styles/brackets.min.css",
    brambleHost + "/dist/bramble.js",
    brambleHost + "/dist/main.js",
    brambleHost + "/dist/thirdparty/thirdparty.min.js"
  ].forEach(function(url) {
    // Load and cache files as plain text (don't parse) and ignore results.
    $.ajax({url: url, dataType: "text"});
  });
}

function setupNewProjectLinks($) {
  var authenticated = $("#navbar-login").hasClass("signed-in");
  var newProjectButton = $("#new-project-button");
  var queryString = window.location.search;

  // This is necessary (versus a simple <a> tag) because
  // we attach a query parameter called "cacheBust" with
  // a unique value to prevent caching
  function newProjectClickHandler(e) {
    e.preventDefault();
    e.stopPropagation();

    var cacheBust = "cacheBust=" + Date.now();
    var qs = queryString === "" ? "?" + cacheBust : queryString + "&" + cacheBust;

    window.location.href = "/projects/new"  + qs;
  }

  if(authenticated) {
    newProjectButton.click(newProjectClickHandler);
    $("#new-project-link").click(newProjectClickHandler);
    return;
  }

  newProjectButton.click(function(e) {
    e.preventDefault();
    e.stopPropagation();

    window.location.href = "/editor" + queryString;
  });
}

function setupAuthentication($, uuid, cookies) {
  var joinEl = $('#signup-link');
  var loginEl = $('#login-link');
  var loginUrl = loginEl.attr("data-loginUrl");

  function signIn(newUser) {
    return function(e) {
      e.preventDefault();

      // OAUTH2 state token
      cookies.expire("state");
      cookies.set("state", uuid.v4());

      var location = loginUrl;

      if (newUser) {
        location += "?signup=true";
      }

      window.location = location;
    };
  }

  // Signup login flow
  joinEl.on('click', signIn(true));

  // Login flow
  loginEl.on('click', signIn());
}

// At this point, all the homepage needs is handlers for the login/logout
// flow. If more needs to be added, the logic should be factored out into
// separate modules, each of which would be initialized here.
// See: public/editor/scripts/main.js
function init($, uuid, cookies) {
  setupAuthentication($, uuid, cookies);
  setupNewProjectLinks($);
  preloadBramble($);
}

require(['jquery', 'uuid', 'cookies'], init);
