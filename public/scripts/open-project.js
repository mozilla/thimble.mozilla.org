(function(){
  var projects = document.querySelectorAll("tr.bramble-user-project");

  function generateUrl(path, date) {
    var url = window.location;
    var qs = url.search;
    if(qs.length < 1) {
      qs = "?";
    }
    qs += "now=" + encodeURIComponent(date);

    return url.protocol + "//" + url.host + "/newProject/" + encodeURIComponent(path) + qs;
  }

  document.getElementById("project-submit").addEventListener("click", function(e) {
    e.preventDefault();

    var projectName = document.getElementById("project-name");
    var value = projectName.value;

    if (value.length < 1) {
      return;
    }

    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState !== 4) {
        return;
      }

      if (request.status === 404) {
        window.location.href = generateUrl(value, (new Date()).toISOString());
      }
    };
    request.responseType = "json";
    request.open("GET", '/projectExists/' + encodeURIComponent(value), true);
    request.send();
  });

  Array.prototype.forEach.call(projects, function(project) {
    project.addEventListener("click", function() {
      window.location.pathname += "project/" + project.getAttribute("data-project-id");
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

  document.getElementById("project-0").addEventListener("click", openModal, false);
  document.getElementById("modal_close").addEventListener("click", closeModal, false);
  document.addEventListener("click", clickHandler, false);
  document.addEventListener("keydown", keyHandler, false);
})();
