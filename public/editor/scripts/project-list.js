require.config({
  waitSeconds: 120,
  paths: {
    "jquery": "/node_modules/jquery/dist/jquery.min",
    "analytics": "/node_modules/webmaker-analytics/analytics",
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
    var publishedUrl = project.getAttribute("data-project-publish_url");
    var publishedId = publishedUrl.substring(publishedUrl.indexOf( "/", publishedUrl.indexOf("/", 7) + 1) + 1);

    if(isLocalStorageAvailable) {
      setFavoriteDataForProject(projectId, projectSelector, project);
    }

    $(projectSelector + " .remix-link").attr("href", publishedId + "/remix");
    $(projectSelector + " .project-information").text(getElapsedTime(lastEdited));
  });

  $("#project-list").prepend(favoriteProjectsElementList);

  var projectsToDelete = [];

  $(".project-delete").click(function() {
    if($(".delete-button").length === 0){
      var deleteBtn = document.createElement("div");
      deleteBtn.appendChild(document.createTextNode("Delete Projects"));
      deleteBtn.className = "delete-button";
      deleteBtn.onclick = function() {
        // TODO: we can do better than this, but let's at least make it harder to lose data.
        if(!window.confirm("{{ deleteProjectConfirmationText }}")) {
          return false;
        }
        
        Array.prototype.forEach.call(projectsToDelete, function(project){
          var projectId = project.attr("data-project-id");
          var projectElementId = project.attr("id");
          $("#" + projectElementId + " > .project-title").off("click");

          analytics.event("DeleteProject");

          var request = $.ajax({
            headers: {
              "X-Csrf-Token": $("meta[name='csrf-token']").attr("content")
            },
            type: "DELETE",
            url: "/" + locale + "/projects/" + projectId,
            timeout: Constants.AJAX_DEFAULT_TIMEOUT_MS
          });
          request.done(function() {
            if(request.status !== 204) {
              console.error("[Thimble error] sending delete request for project ", projectId, request.status);
            }
          });
          request.fail(function(jqXHR, status, err) {
            err = err || new Error("unknown network error");
            console.error(err);
          });

          project.hide({
            duration: 250,
            easing: "linear",
            done: function() {
              project.remove();
            }
          });
        });
        projectsToDelete = [];
        $(".delete-button").remove();
      };
      var listWrapper = document.getElementsByClassName("project-list-wrapper");
      listWrapper[0].appendChild(deleteBtn);
    }

    var project = $(this).closest(".project");
    var projectSelector = "#" + project.attr("id");
    var deleteIndex = projectsToDelete.findIndex(function(x) {return x.attr("id") === project.attr("id");});
    var disabledLink = {"cursor":"default", "text-decoration":"none"};
    var enabledLink = {"cursor":"pointer", "text-decoration":"underline"};
    
    if(deleteIndex === -1) {
      projectsToDelete.push(project);
      $(projectSelector + " .edit-link").bind("click", false).css({"cursor":"default"});
      if($(projectSelector + " .published-link").length !== 0) {
        $(projectSelector + " .published-link").bind("click", false).css(disabledLink);
        $(projectSelector + " .remix-link").bind("click", false).css(disabledLink);
      }
      project.css("background", "rgba(255,0,0,.08)");
      $(this).closest(".project-delete").html("Cancel");
    } else {
      projectsToDelete.splice(deleteIndex, 1);
      $(projectSelector + " .edit-link").unbind("click", false).css({"cursor":"pointer"});
      if($(projectSelector + " .published-link").length !== 0) {
        $(projectSelector + " .published-link").unbind("click", false).css(enabledLink);
        $(projectSelector + " .remix-link").unbind("click", false).css(enabledLink);
      }
      project.css("background", "");
      $(this).closest(".project-delete").html("<div class='icon-garbage-can'></div> {{prjListDeleteProjectBtn}}");
      if(projectsToDelete.length === 0) {
        $(".delete-button").remove();
      }
    }

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

    analytics.event({ category : analytics.eventCategories.PROJECT_ACTIONS, action : "New Authenticated Project" });
    window.location.href = "/" + locale + "/projects/new" + qs;
  }

  $("#new-project-link").one("click", newProjectClickHandler);
  $("#project-0").one("click", newProjectClickHandler);
}

require(['jquery', 'uuid', 'cookies', 'fc/bramble-popupmenu', 'analytics'], init);
