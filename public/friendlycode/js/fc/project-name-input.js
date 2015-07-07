define(function(require) {
  var $ = require("jquery");

  function ProjectNameInput(container, options) {
    this.container = container;
    this.appUrl = options.appUrl;
  }

  ProjectNameInput.prototype.init = function() {
    this.saveButton = $("#project-rename-save");
    this.renameButton = $("#navbar-rename-project");
    this.container.one("click", this.enableInput.bind(this));

    Object.defineProperty(this, "inputField", {
      get: function() {
        return $("#project-title");
      }
    });
  };

  ProjectNameInput.prototype.enableInput = function() {
    var title = this.inputField.text();
    this.container.removeClass("shadow");

    this.inputField.replaceWith(this.generateInputField);
    this.inputField.addClass("text-input").focus().val(title);

    this.saveButton.show();
    this.saveButton.one("click", this.captureInput.bind(this));

    this.renameButton.hide();
  };

  ProjectNameInput.prototype.captureInput = function(event) {
    event.stopPropagation();

    var projectNameInput = this;
    var title = projectNameInput.inputField.val();

    projectNameInput.rename(function(err) {
      if(err) {
        console.error("[Bramble] Failed to rename the project with ", err);
        return;
      }

      projectNameInput.saveButton.hide();

      projectNameInput.inputField.replaceWith(function() {
        return projectNameInput.generatePlaceholder(title);
      });

      projectNameInput.renameButton.show();
      projectNameInput.container.addClass("shadow");
      projectNameInput.container.one("click", projectNameInput.enableInput.bind(projectNameInput));
    });
  };

  ProjectNameInput.prototype.rename = function(callback) {
    callback();
  };

  ProjectNameInput.prototype.generateInputField = function() {
    return $("<input type=\"text\" id=\"project-title\" />");
  };

  ProjectNameInput.prototype.generatePlaceholder = function(content) {
    return $("<span id=\"project-title\">" + content + "</span>");
  };

  return ProjectNameInput;
});
