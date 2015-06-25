(function() {
  require(["jquery"], function($) {
    var projects = document.querySelectorAll("tr.bramble-user-project");
    var queryString = window.location.search;
    // We do this to deal with the weird Firefox caching issue
    // that does not allow a click on the project name to reach the
    // `/projects/:projectID` route and instead just loads a cached
    // vaersion of `/`
    var cacheBust = "cacheBust=" + Date.now();
    queryString = queryString === "" ? "?" + cacheBust : queryString + "&" + cacheBust;

    function generateUrl(path, date) {
      var url = window.location;
      var qs = url.search;
      qs = qs.length < 1 ? "?" : qs + "&";
      qs += "now=" + encodeURIComponent(date);

      return "//" + url.host + "/newProject/" + encodeURIComponent(path) + qs;
    }

    $("#project-submit").on("click", function(e) {
      e.preventDefault();

      var projectName = $("#new-project-name").val();
      if (projectName.length < 1) {
        return;
      }

      $.ajax({
        type: "GET",
        url: "/projectExists/" + encodeURIComponent(projectName),
        statusCode: {
          404: function() {
            window.location.href = generateUrl(projectName, (new Date()).toISOString());
          }
        }
      });
    });

    Array.prototype.forEach.call(projects, function(project) {
      $("#" + project.getAttribute("id") + " > .project-title").on("click", function() {
        window.location.href = "/project/" + project.getAttribute("data-project-id") + queryString;
      });
    });

    /**
     * Modal logic
     */
    // Original JavaScript code by Chirp Internet: www.chirp.com.au
    // Please acknowledge use of this code by including this header.
    var modalWrapper = document.getElementById("modal_wrapper");
    var modalWindow  = document.getElementById("modal_window");

    var openModal = function(e) {
      e.preventDefault();

      modalWrapper.className = "overlay";
      modalWindow.style.marginTop = (-modalWindow.offsetHeight)/2 + "px";
      modalWindow.style.marginLeft = (-modalWindow.offsetWidth)/2 + "px";
    };

    var closeModal = function(e) {
      modalWrapper.className = "";
      e.preventDefault();
    };

    var clickHandler = function(e) {
      if(e.target.tagName == "DIV") {
        if(e.target.id != "modal_window" && e.target.id != "project-0" && e.target.id != "project-submit") closeModal(e);
      }
    };

    var keyHandler = function(e) {
      if(e.keyCode == 27) closeModal(e);
    };

    $("#project-0").on("click", openModal);
    $("#modal_close").on("click", closeModal);
    document.addEventListener("click", clickHandler, false);
    document.addEventListener("keydown", keyHandler, false);

    $("td.project-delete").click(function() {
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
}());
