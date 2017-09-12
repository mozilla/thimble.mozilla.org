/* globals $: true */

var $ = require("jquery");
var moment = require("moment");
require("moment/min/locales.min");
var strings = require("strings");

var Constants = require("../../shared/scripts/constants");
var analytics = require("../../shared/scripts/analytics");
var userbar = require("../../shared/scripts/userbar");

var LOCALE = "en-US";
var favorites;
var $projectsToDelete = [];
var $favoriteProjectsList = [];
var isLocalStorageAvailable = !!window.localStorage;

function deleteProject($project) {
  var projectId = $project.attr("data-project-id");

  analytics.event({
    category: analytics.eventCategories.PROJECT_ACTIONS,
    action: "Delete Project"
  });

  var request = $.ajax({
    headers: {
      "X-Csrf-Token": $("meta[name='csrf-token']").attr("content")
    },
    type: "DELETE",
    url: "/" + LOCALE + "/projects/" + projectId,
    timeout: Constants.AJAX_DEFAULT_TIMEOUT_MS
  });
  request.done(function() {
    if (request.status !== 204) {
      console.error(
        "[Thimble error] Failed to delete project ",
        projectId,
        " with status: ",
        request.status
      );
    }

    $project.slideToggle({
      done: function() {
        $project.remove();
      }
    });
  });
  request.fail(function(jqXHR, status, err) {
    console.error("Failed to delete project with: ", err);
  });
}

function addProjectDeleteListeners() {
  $(".delete-button").click(function() {
    // TODO: we can do better than this, but let's at least make it harder to lose data.
    if (!window.confirm(strings.get("deleteProjectConfirmationText"))) {
      return false;
    }

    $projectsToDelete.forEach(deleteProject);
    $projectsToDelete = [];

    $(".delete-button").hide();

    return false;
  });

  $(".project-delete, .project-delete-cancel").click(function() {
    var $project = $(this).closest(".project");

    if ($project.hasClass("pending-delete")) {
      $projectsToDelete.splice($projectsToDelete.indexOf($project), 1);
    } else {
      $projectsToDelete.push($project);
    }

    $project
      .find("a.edit-link, " + "a.project-favorite-button, " + "a.remix-link")
      .toggleClass("disabled-link");

    $project.toggleClass("pending-delete");
    $project
      .find("div.project-delete, " + "div.project-delete-cancel")
      .toggleClass("hide");

    if ($projectsToDelete.length === 0) {
      $(".delete-button").hide();
    } else {
      $(".delete-button").show();
    }

    return false;
  });
}

function setFavoriteDataForProject(projectId, projectSelector, project) {
  var indexOfProjectInFavorites = favorites.indexOf(projectId);
  var projectFavoriteButton = projectSelector + " .project-favorite-button";

  if (indexOfProjectInFavorites !== -1) {
    $favoriteProjectsList.push(project);
    $(projectFavoriteButton).toggleClass("project-favorite-selected");
  }

  $(projectSelector + " .project-favorite-button").on("click", function() {
    var indexOfProjectInFavorites = favorites.indexOf(projectId);
    var projectFavoriteButton = projectSelector + " .project-favorite-button";

    if (indexOfProjectInFavorites === -1) {
      favorites.push(projectId);
    } else {
      favorites.splice(indexOfProjectInFavorites, 1);
    }

    localStorage.setItem("project-favorites", JSON.stringify(favorites));
    $(projectFavoriteButton).toggleClass("project-favorite-selected");
  });
}

function getElapsedTime(lastEdited) {
  var timeElapsed = moment(new Date(lastEdited)).fromNow();

  return strings
    .get("momentJSLastEdited")
    .replace("<% timeElapsed %>", timeElapsed);
}

function setProjectHandlers() {
  var projects = document.querySelectorAll(".bramble-user-project");

  Array.prototype.forEach.call(projects, function(project) {
    var projectSelector = "#" + project.getAttribute("id");
    var lastEdited = project.getAttribute("data-project-date_updated");
    var projectId = project.getAttribute("data-project-id");

    if (isLocalStorageAvailable) {
      setFavoriteDataForProject(projectId, projectSelector, project);
    }

    $(projectSelector + " .project-information").text(
      getElapsedTime(lastEdited)
    );
  });

  $("#project-list").prepend($favoriteProjectsList);
  addProjectDeleteListeners();
}

$(function init() {
  LOCALE = $("html")[0].lang;
  moment.locale($("meta[name='moment-lang']").attr("content"));
  userbar.createDropdownMenus(["#navbar-help"]);
  document.querySelector("#project-list").classList.add("loaded");

  if (isLocalStorageAvailable) {
    try {
      favorites = JSON.parse(localStorage.getItem("project-favorites")) || [];
    } catch (e) {
      console.error(
        "failed to get project favorites from localStorage with: ",
        e
      );
    }
  }

  setProjectHandlers();
});
