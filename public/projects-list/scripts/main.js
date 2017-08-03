require.config({
  waitSeconds: 120,
  paths: {
    "jquery": "/node_modules/jquery/dist/jquery.min",
    "analytics": "/{{ locale }}/shared/scripts/analytics",
    "constants": "/{{ locale }}/shared/scripts/constants",
    "uuid": "/node_modules/node-uuid/uuid",
    "cookies": "/node_modules/cookies-js/dist/cookies",
    "moment": "/node_modules/moment/min/moment-with-locales.min",
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

require(["jquery", "constants", "analytics", "moment"], function($, Constants, analytics, moment) {
  document.querySelector("#project-list").classList.add("loaded");
  var projects = document.querySelectorAll(".bramble-user-project");
  var locale = $("html")[0].lang;
  var isLocalStorageAvailable = !!(window.localStorage);
  var favorites;
  var $projectsToDelete = [];
  if(isLocalStorageAvailable){
    try {
      favorites = JSON.parse(localStorage.getItem("project-favorites")) || [];
    } catch(e) {
      console.error("failed to get project favorites from localStorage with: ", e);
    }
  }
  moment.locale($("meta[name='moment-lang']").attr("content"));

  function getElapsedTime(lastEdited) {
    var timeElapsed = moment(new Date(lastEdited)).fromNow();

    return "{{ momentJSLastEdited | safe }}".replace("<% timeElapsed %>", timeElapsed);
  }

  function setFavoriteDataForProject(projectId, projectSelector, project){
    var indexOfProjectInFavorites = favorites.indexOf(projectId);
    var projectFavoriteButton = projectSelector + " .project-favorite-button";

    if(indexOfProjectInFavorites !== -1){
      favoriteProjectsElementList.push(project);
      $(projectFavoriteButton).toggleClass("project-favorite-selected");
    }

    $(projectSelector + " .project-favorite-button").on("click", function() {
      var indexOfProjectInFavorites = favorites.indexOf(projectId);
      var projectFavoriteButton = projectSelector + " .project-favorite-button";

      if(indexOfProjectInFavorites === -1) {
        favorites.push(projectId);
      } else {
        favorites.splice(indexOfProjectInFavorites, 1);
      }

      localStorage.setItem("project-favorites", JSON.stringify(favorites));
      $(projectFavoriteButton).toggleClass("project-favorite-selected");
    });
  }

  var favoriteProjectsElementList = [];

  Array.prototype.forEach.call(projects, function(project) {
    var projectSelector = "#" + project.getAttribute("id");
    var lastEdited = project.getAttribute("data-project-date_updated");
    var projectId = project.getAttribute("data-project-id");

    if(isLocalStorageAvailable) {
      setFavoriteDataForProject(projectId, projectSelector, project);
    }

    $(projectSelector + " .project-information").text(getElapsedTime(lastEdited));
  });

  $("#project-list").prepend(favoriteProjectsElementList);

  function deleteProject($project) {
    var projectId = $project.attr("data-project-id");

    analytics.event({ category : analytics.eventCategories.PROJECT_ACTIONS, action : "Delete Project" });

    var request = $.ajax({
      headers: {
        "X-Csrf-Token": $("meta[name='csrf-token']").attr("content")
      },
      type: "DELETE",
      url: "/" + locale + "/projects/" + projectId,
      timeout: Constants.AJAX_DEFAULT_TIMEOUT_MS
    });
    request.done(function(){
      if(request.status !== 204) {
        console.error("[Thimble error] Failed to delete project ", projectId, " with status: ", request.status);
      }

      $project.slideToggle({
        done: function() {
          $project.remove();
        }
      });
    });
    request.fail(function(jqXHR, status, err){
      console.error("Failed to delete project with: ", err);
    });
  }

  $(".delete-button").click(function() {
    // TODO: we can do better than this, but let's at least make it harder to lose data.
    if(!window.confirm("{{ deleteProjectConfirmationText }}")) {
      return false;
    }

    $projectsToDelete.forEach(deleteProject);
    $projectsToDelete = [];

    $(".delete-button").hide();

    return false;
  });

  $(".project-delete, .project-delete-cancel").click(function() {
    var $project = $(this).closest(".project");

    if($project.hasClass("pending-delete")) {
      $projectsToDelete.splice($projectsToDelete.indexOf($project), 1);
    } else {
      $projectsToDelete.push($project);
    }

    $project.find(
      "a.edit-link, " +
      "a.project-favorite-button, " +
      "a.remix-link"
    ).toggleClass("disabled-link");

    $project.toggleClass("pending-delete");
    $project.find(
      "div.project-delete, " +
      "div.project-delete-cancel"
    ).toggleClass("hide");

    if($projectsToDelete.length === 0) {
      $(".delete-button").hide();
    } else {
      $(".delete-button").show();
    }

    return false;
  });
});

function init($, uuid, cookies, PopupMenu, analytics) {
  PopupMenu.create("#navbar-logged-in .dropdown-toggle", "#navbar-logged-in .dropdown-content");
  PopupMenu.create("#navbar-locale .dropdown-toggle", "#navbar-locale .dropdown-content");
  setupNewProjectLinks($, analytics);
}

function setupNewProjectLinks($, analytics) {
  var queryString = window.location.search;
  var locale = $("html")[0].lang;

  function newProjectClickHandler(e) {
    e.preventDefault();
    e.stopPropagation();

    var cacheBust = "cacheBust=" + Date.now();
    var qs = queryString === "" ? "?" + cacheBust : queryString + "&" + cacheBust;

    $(e.target).text("{{ newProjectInProgressIndicator }}");
    $(e.target).addClass("disabled");

    analytics.event({ category : analytics.eventCategories.PROJECT_ACTIONS, action : "New Authenticated Project" });
    window.location.href = "/" + locale + "/projects/new" + qs;
  }

  $("#new-project-link").one("click", newProjectClickHandler);
  $("#project-0").one("click", newProjectClickHandler);
}

require(['jquery', 'uuid', 'cookies', 'fc/bramble-popupmenu', 'analytics'], init);
