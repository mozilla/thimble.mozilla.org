define(function(require) {
  var $ = require("jquery");
  var InputField = require("fc/bramble-input-field");

  function toggleComponents(context, isSave) {
    context.saveButton[isSave ? "hide" : "show"]();
    context.renameButton[isSave ? "show" : "hide"]();
    context.titleBar[isSave ? "save" : "edit"]();
    context.titleBar[isSave ? "removeClass" : "addClass"]("text-input");
    context.container[isSave ? "addClass" : "removeClass"]("shadow");
  }

  function persist(title, callback) {
    var appUrl = this.appUrl;
    var csrfToken = this.csrfToken;

    if(!this.authenticated) {
      callback();
      return;
    }

    var request = $.ajax({
      contentType: "application/json",
      headers: {
        "X-Csrf-Token": csrfToken
      },
      type: "PUT",
      url: appUrl + "/renameProject",
      data: JSON.stringify({
        title: title
      })
    });
    request.done(function(data) {
      if(request.status !== 200) {
        callback(data);
        return;
      }

      callback();
    });
    request.fail(function(jqXHR, status, err) {
      callback(err);
    });
  }

  function save(event) {
    event.stopPropagation();

    var context = this;

    persist.call(context, context.titleBar.val(), function(err) {
      if(err) {
        console.error("[Bramble] Failed to rename the project with ", err);
        return;
      }

      toggleComponents(context, true);
      context.container.one("click", rename.bind(context));
    });
  }

  function rename() {
    toggleComponents(this, false);
    this.saveButton.one("click", save.bind(this));
  }

  function ProjectRenameUtility(appUrl, authenticated, csrfToken, projectTitle) {
    this.appUrl = appUrl;
    this.authenticated = authenticated;
    this.csrfToken = csrfToken;
    this.container = $("#navbar-project-title");
    this.saveButton = $("#project-rename-save");
    this.renameButton = $("#navbar-rename-project");
    this.titleBar = new InputField(this.container, true);
    this.titleBar.id = "project-title";
    this.titleBar.val(projectTitle);
    this.fs = Bramble.getFileSystem();

    this.container.one("click", rename.bind(this));
  }

  return ProjectRenameUtility;
});
