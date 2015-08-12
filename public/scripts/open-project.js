require.config({
  paths: {
    "jquery": "/bower/jquery/index"
  },
  shim: {
    "jquery": {
      exports: "$"
    }
  }
});

require(["jquery"], function($) {
  var projects = document.querySelectorAll("tr.bramble-user-project");
  var queryString = window.location.search;
  // We do this to deal with the weird Firefox caching issue
  // that does not allow a click on the project name to reach the
  // `/projects/:projectID` route and instead just loads a cached
  // vaersion of `/`
  var cacheBust = "cacheBust=" + Date.now();
  queryString = queryString === "" ? "?" + cacheBust : queryString + "&" + cacheBust;

  function getElapsedTime(lastEdited) {
    var now = Date.now();
    lastEdited = new Date(lastEdited);
    var elapsedTime, unit = "";
    var secondsElapsed = (now - lastEdited) / 1000;
    var minutesElapsed = secondsElapsed / 60;
    var hoursElapsed = minutesElapsed / 60;
    var daysElapsed = hoursElapsed / 24;

    if(daysElapsed > 31) {
      elapsedTime = "over a month";
    } else if(daysElapsed >= 1) {
      elapsedTime = Math.round(daysElapsed);
      unit = elapsedTime === 1 ? " day" : " days";
    } else if(hoursElapsed >= 1) {
      elapsedTime = Math.round(hoursElapsed);
      unit = elapsedTime === 1 ? " hour" : " hours";
    } else if(minutesElapsed >= 1) {
      elapsedTime = Math.round(minutesElapsed);
      unit = elapsedTime === 1 ? " minute" : " minutes";
    } else {
      elapsedTime = Math.round(secondsElapsed);
      unit = elapsedTime === 1 ? " second" : " seconds";
    }

    return "Last Edited " + elapsedTime + unit + " ago";
  }

  Array.prototype.forEach.call(projects, function(project) {
    var projectSelector = "#" + project.getAttribute("id");
    var lastEdited = project.getAttribute("data-project-date_updated");

    $(projectSelector + " > .project-title").on("click", function() {
      window.location.href = "/project/" + project.getAttribute("data-project-id") + queryString;
    });
    $(projectSelector + " .project-information").text(getElapsedTime(lastEdited));
  });

  $("#project-0").on("click", function() {
    window.location.href = "/newProject" + queryString + "&now=" + (new Date()).toISOString();
  });

  $("td.project-delete").click(function() {
    // TODO: we can do better than this, but let's at least make it harder to lose data.
    if(!window.confirm("OK to Delete this project?")) {
      return;
    }

    var project = $(this).parent();
    $(this).text("Deleting...");

    var projectId = project.attr("data-project-id");
    var projectElementId = project.attr("id");
    $("#" + projectElementId + " > .project-title").off("click");

    var request = $.ajax({
      headers: {
        "X-Csrf-Token": $("meta[name='csrf-token']").attr("content")
      },
      type: "DELETE",
      url: "/deleteProject/" + projectId
    });
    request.done(function() {
      if(request.status !== 204) {
        console.error("Error sending delete request");
        return;
      }

      project.hide({
        duration: 1000,
        easing: "linear",
        done: function() {
          project.remove();
        }
      });
    });
    request.fail(function(jqXHR, status, err) {
      console.error(err);
    });
  });
});
