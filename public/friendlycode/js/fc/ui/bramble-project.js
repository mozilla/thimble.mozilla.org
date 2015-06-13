define(["jquery.min"], function($) {
  "use strict";

  var self = {};

  self.updateMeta = function(project) {
    // Update the project title in the userbar
    // see views/userbar.html
    $("#project-title").text(project.title || "New Project");
  };

  return self;
});
