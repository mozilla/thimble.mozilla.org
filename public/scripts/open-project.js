(function(){
  var projects = document.querySelectorAll("tr.bramble-user-project");

  document.getElementById("project-0").addEventListener("click", function(e) {
    e.preventDefault();
    window.location.pathname += "newProject";
  });

  Array.prototype.forEach.call(projects, function(project) {
    project.addEventListener("click", function() {
      window.location.pathname += "project/" + project.getAttribute("data-project-id");
    });
  });
})();
