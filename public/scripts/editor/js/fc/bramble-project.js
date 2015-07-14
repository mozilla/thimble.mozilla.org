define(["jquery", "constants"], function($, Constants) {
  function updateMeta(project) {
    // Update the project title in the userbar
    // see views/userbar.html
    $("#project-title").text(project.title || Constants.ANON_PROJECT_NAME);
  }

  return {
    updateMeta: updateMeta
  };
});
