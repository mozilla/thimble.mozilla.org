require.config({
  baseUrl: "/editor/scripts/editor/js",
  paths: {
    "jquery": "/bower/jquery/index",
    "logger": "../../logger",
    "constants": "../../constants"
  },
  shim: {
    "jquery": {
      exports: "$"
    }
  }
});

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

  return "Last edited " + elapsedTime + unit + " ago";
}

function createTableRow(id) {
  return "<tr class=\"project bramble-user-project\" id=\"" + id + "\">\n" +
         "  <td class=\"project-title\">" + id + "<span class=\"project-information\">&nbsp;</span></td>\n" +
         "  <td>\n" +
         "    <div class=\"project-delete\" title=\"Delete this Project\">\n" +
         "       <div class=\"icon-garbage-can\">\n" +
         "         <div class=\"icon-garbage-lid\"></div>\n" +
         "       </div>\n" +
         "       Delete\n" +
         "    </div>\n" +
         "  </td>\n" +
         "</tr>\n\n";
}

require(["jquery", "constants"], function($, Constants) {
  var queryString = window.location.search;

  function setupLocalProjectList() {
    function findLocalProjects() {
      var fs = Bramble.getFileSystem();
      var Path = Bramble.Filer.Path;
      var sh = new fs.Shell();
      var root = Constants.ANONYMOUS_USER_FOLDER;

      fs.readdir(root, function(err, entries) {
        if(err) {
          console.log("[Thimble Error] unable to read anonymous project root:", err);
          return;
        }

        var table$ = $("#project-list-anonymous");
        entries.forEach(function(entry) {
          table$.append(createTableRow(entry));
          $("#anonymous-project-" + entry).on("click", function() {
            window.location.href = "/anonymous/" + entry + queryString;
          });
        });

        $("#local-projects .project-delete").click(function() {
          // TODO: we can do better than this, but let's at least make it harder to lose data.
          if(!window.confirm("OK to Delete this project?")) {
            return false;
          }

          var project = $(this).closest(".project");
          var projectPath = Path.join(root, project.attr("id"));

          project.hide({
            duration: 250,
            easing: "linear",
            done: function() {
              project.remove();

              // If there are no rows left, remove the table.
              if(!$("#project-list-anonymous tr").length) {
                $("#local-projects").addClass("hide");
              }
            }
          });

          // Remove this folder, and all files/folders within, from the local filesystem
          sh.rm(projectPath, {recursive: true}, function(err) {
            if(err) {
              console.log("[Thimble Error] unable to remove local project `" + projectPath + "`:", err);
            }
          });

          return false;
        });

        // Show the list of anonymous local projects, if any
        if($("#project-list-anonymous tr").length) {
          $("#local-projects").removeClass("hide");
        }
      });
    }

    findLocalProjects();
  }

  function setupRemoteProjectList() {
    var username = encodeURIComponent($("#project-list").data("username"));

    $("tr.bramble-user-project").each(function(idx, project) {
      var project$ = $(project);
      var projectSelector = "#" + project.id;
      var lastEdited = project$.data("project-date_updated");

      $(projectSelector + " > .project-title").on("click", function() {
        window.location.href = "/user/" + username + "/" + project$.data("project-id") + queryString;
      });
      $(projectSelector + " .project-information").text(getElapsedTime(lastEdited));
    });

    $("#remote-projects .project-delete").click(function() {
      // TODO: we can do better than this, but let's at least make it harder to lose data.
      if(!window.confirm("OK to Delete this project?")) {
        return false;
      }

      var project = $(this).closest(".project");
      var projectId = project.data("project-id");
      var projectElementId = project.attr("id");
      $("#" + projectElementId + " > .project-title").off("click");

      var request = $.ajax({
        headers: {
          "X-Csrf-Token": $("meta[name='csrf-token']").attr("content")
        },
        type: "DELETE",
        url: "/projects/" + projectId
      });
      request.done(function() {
        if(request.status !== 204) {
          console.error("[Thimble error] sending delete request for project ", projectId, request.status);
        }
      });
      request.fail(function(jqXHR, status, err) {
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
  }

  $("#project-0").on("click", function() {
    window.location.href = "/projects/new" + queryString + (queryString === "" ? "?" : "&") + "cacheBust=" + Date.now();
  });

  setupRemoteProjectList();
  setupLocalProjectList();
});
