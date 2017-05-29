/* global requirejs */

// Because we pre-load require scripts needed by the editor, we need to
// eat error messages related to fetching but not using those modules.
requirejs.onError = function(err) {
  if(err.requireType !== "mismatch") {
    throw err;
  }
};

require.config({
  waitSeconds: 120,
  baseUrl: "/{{ locale }}/homepage/scripts",
  paths: {
    "jquery": "/node_modules/jquery/dist/jquery.min",
    "localized": "/node_modules/webmaker-i18n/localized",
    "uuid": "/node_modules/node-uuid/uuid",
    "cookies": "/node_modules/cookies-js/dist/cookies",
    "analytics": "/{{ locale }}/editor/scripts/analytics",
    "gallery": "/{{ locale }}/homepage/scripts/gallery",
    "getinvolved": "/{{ locale }}/homepage/scripts/getinvolved",
    // TODO: we should really put the homepage and editor in the same scope for code sharing
    "fc/bramble-popupmenu": "/{{ locale }}/editor/scripts/editor/js/fc/bramble-popupmenu",
    "fc/bramble-keyhandler": "/{{ locale }}/editor/scripts/editor/js/fc/bramble-keyhandler",
    "fc/bramble-underlay": "/{{ locale }}/editor/scripts/editor/js/fc/bramble-underlay"
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
  brambleHost = brambleHost.replace(/\/$/, "");
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

function setupNewProjectLinks($, analytics) {
  var authenticated = $("#navbar-login").hasClass("signed-in");
  var newProjectButton = $("#new-project-button");
  var locale = $("html")[0].lang;
  var queryString = window.location.search;

  // This is necessary (versus a simple <a> tag) because
  // we attach a query parameter called "cacheBust" with
  // a unique value to prevent caching
  function newProjectClickHandler(e) {
    e.preventDefault();
    e.stopPropagation();

    var cacheBust = "cacheBust=" + Date.now();
    var qs = queryString === "" ? "?" + cacheBust : queryString + "&" + cacheBust;

    $("#new-project-button-text").text("{{ newProjectInProgressIndicator }}");

    if(authenticated) {
      analytics.event({ category : analytics.eventCategories.HOMEPAGE, action : "New Authenticated Project" });
      window.location.href = "/" + locale + "/projects/new" + qs;
    } else {
      analytics.event({ category : analytics.eventCategories.HOMEPAGE, action : "New Anonymous Project" });
      window.location.href = "/" + locale + "/editor" + queryString;
    }
  }

  if(authenticated) {
    $("#new-project-link").one("click", newProjectClickHandler);
  }

  newProjectButton.one("click", newProjectClickHandler);
}

function setupAuthentication($, uuid, cookies, analytics) {
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
        analytics.event({ category : analytics.eventCategories.HOMEPAGE, action : "Create Account" });
        location += "?signup=true";
      } else {
        analytics.event({ category : analytics.eventCategories.HOMEPAGE, action : "Sign In" });
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
function init($, uuid, cookies, PopupMenu, analytics, gallery, getinvolved) {
  PopupMenu.create("#navbar-logged-in .dropdown-toggle", "#navbar-logged-in .dropdown-content");
  PopupMenu.create("#navbar-locale .dropdown-toggle", "#navbar-locale .dropdown-content");
  setupAuthentication($, uuid, cookies, analytics);
  setupNewProjectLinks($, analytics);
  gallery.init();
  getinvolved.init();
  preloadBramble($);
}

require(['jquery', 'uuid', 'cookies', 'fc/bramble-popupmenu', 'analytics', 'gallery', 'getinvolved'], init);
