/* globals $: true */

var $ = require("jquery");
var uuid = require("uuid");
var cookies = require("cookies-js");
var strings = require("strings");

var features = require("./features");
var gallery = require("./gallery");
var getinvolved = require("./getinvolved");
var analytics = require("../../shared/scripts/analytics");
var userbar = require("../../shared/scripts/userbar");

function setupNewProjectLinks() {
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
    var qs =
      queryString === "" ? "?" + cacheBust : queryString + "&" + cacheBust;

    $("#new-project-button-text").text(
      strings.get("newProjectInProgressIndicator")
    );

    if (authenticated) {
      analytics.event({
        category: analytics.eventCategories.HOMEPAGE,
        action: "New Authenticated Project"
      });
      window.location.href = "/" + locale + "/projects/new" + qs;
    } else {
      analytics.event({
        category: analytics.eventCategories.HOMEPAGE,
        action: "New Anonymous Project"
      });
      window.location.href = "/" + locale + "/editor" + queryString;
    }
  }

  if (authenticated) {
    $("#new-project-link").one("click", newProjectClickHandler);
  }

  newProjectButton.one("click", newProjectClickHandler);
}

function setupAuthentication() {
  var joinEl = $("#signup-link");
  var loginEl = $("#login-link");
  var loginUrl = loginEl.attr("data-loginUrl");

  function signIn(newUser) {
    return function(e) {
      e.preventDefault();

      // OAUTH2 state token
      cookies.expire("state");
      cookies.set("state", uuid.v4());

      var location = loginUrl;

      if (newUser) {
        analytics.event({
          category: analytics.eventCategories.HOMEPAGE,
          action: "Create Account"
        });
        location += "?signup=true";
      } else {
        analytics.event({
          category: analytics.eventCategories.HOMEPAGE,
          action: "Sign In"
        });
      }

      window.location = location;
    };
  }

  // Signup login flow
  joinEl.on("click", signIn(true));

  // Login flow
  loginEl.on("click", signIn());
}

// At this point, all the homepage needs is handlers for the login/logout
// flow. If more needs to be added, the logic should be factored out into
// separate modules, each of which would be initialized here.
// See: public/editor/scripts/main.js
$(function init() {
  userbar.createDropdownMenus(["#navbar-help"]);
  setupAuthentication();
  setupNewProjectLinks();
  gallery.init();
  features.init();
  getinvolved.init();
});
