define(["jquery", "constants"], function($, Constants) {
  function updateMeta(project) {
    // Update the project title in the userbar
    // see views/userbar.html
    var title = project.title || Constants.ANON_PROJECT_NAME;
    $("#project-title").text(title);
  }

  return {
    updateMeta: updateMeta
  };
});
