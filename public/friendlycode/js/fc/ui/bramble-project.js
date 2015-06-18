define(["jquery.min"], function($) {
  "use strict";

  function updateMeta(project) {
    // Update the project title in the userbar
    // see views/userbar.html
    $("#project-title").text(project.title || "New Project");
  }

  return {
    updateMeta: updateMeta
  };
});
