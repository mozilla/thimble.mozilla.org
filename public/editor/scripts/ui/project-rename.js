/* globals $: true */
var $ = require("jquery");
var strings = require("strings");

var InputField = require("../lib/input-field");
var Project = require("../project");
var KeyHandler = require("../../../shared/scripts/keyhandler");
var analytics = require("../../../shared/scripts/analytics");
var constants = require("../../../shared/scripts/constants");

var AJAX_DEFAULT_TIMEOUT_MS = constants.AJAX_DEFAULT_TIMEOUT_MS;

function toggleComponents(context, isSave) {
  var container = context.container;
  var titleBar = context.titleBar;
  var saveButton = context.saveButton;

  function saveClicked() {
    // Ignore clicks if the button is disabled.
    if (context.saveButton.hasClass("disabled")) {
      return false;
    }

    context.saveButton.off("click", saveClicked);
    save(context);
    return false;
  }

  function textClicked() {
    rename(context);
    return false;
  }

  saveButton.text(strings.get("renameProjectSaveBtn"));
  saveButton[isSave ? "hide" : "show"]();
  context.renameButton[isSave ? "show" : "hide"]();
  titleBar[isSave ? "save" : "edit"]();
  titleBar[isSave ? "removeClass" : "addClass"]("text-input");
  container[isSave ? "addClass" : "removeClass"]("shadow");

  if (isSave) {
    context.keyHandlers.enter.stop();
    context.keyHandlers.esc.stop();
    delete context.keyHandlers;

    context.container.one("click", textClicked);
  } else {
    context.keyHandlers = {
      enter: new KeyHandler.Enter(container, function() {
        var val = context.titleBar.val();
        if (val.length === 0) {
          return;
        }

        context.saveButton.off("click", saveClicked);
        save(context);
      }),
      esc: new KeyHandler.ESC(container, function() {
        // Restore the current title if ESC is pressed
        context.titleBar.val(Project.getTitle());

        context.saveButton.off("click", saveClicked);
        editingComplete(context);
      }),
      any: new KeyHandler.Any(container, function() {
        var input = context.titleBar;
        var nameLength = input.val().length;

        // Add or remove the 'disabled' class based on title length
        context.saveButton[nameLength === 0 ? "addClass" : "removeClass"](
          "disabled"
        );
      })
    };

    titleBar.select();
    saveButton.on("click", saveClicked);
  }
}

function persist(title, callback) {
  var appUrl = this.appUrl;
  var csrfToken = this.csrfToken;

  if (!Project.getUser()) {
    callback();
    return;
  }

  var request = $.ajax({
    contentType: "application/json",
    headers: {
      "X-Csrf-Token": csrfToken
    },
    type: "PUT",
    url: appUrl + "/projects/" + Project.getID() + "/rename",
    data: JSON.stringify({
      title: title
    }),
    timeout: AJAX_DEFAULT_TIMEOUT_MS
  });
  request.done(function(data) {
    if (request.status !== 200) {
      callback(data);
      return;
    }

    callback();
  });
  request.fail(function(jqXHR, status, err) {
    err = err || new Error("unknown network error");
    callback(err);
  });
}

function rename(context) {
  toggleComponents(context, false);
}

function editingComplete(context) {
  toggleComponents(context, true);
}

function save(context) {
  var contextTitle = context.titleBar.val();
  // Do not apply save if project title remains the same
  if (contextTitle === Project.getTitle()) {
    editingComplete(context);
  } else {
    context.saveButton.text(strings.get("renameProjectSavingIndicator"));

    persist.call(context, contextTitle, function(err) {
      if (err) {
        console.error("[Bramble] Failed to rename the project. Error: ", err);
        return;
      }

      Project.setTitle(contextTitle, function(err) {
        if (err) {
          console.error(
            "[Bramble] Failed to update the project internally: ",
            err
          );
          return;
        }
        editingComplete(context);
        analytics.event({
          category: analytics.eventCategories.PROJECT_ACTIONS,
          action: "Rename Project"
        });

        if (context.publisher) {
          context.publisher.showUnpublishedChangesPrompt();
        }
      });
    });
  }
}

function ProjectRenameUtility(appUrl, csrfToken, publisher) {
  var context = this;

  this.appUrl = appUrl;
  this.csrfToken = csrfToken;
  this.publisher = publisher;
  this.container = $("#navbar-project-title");
  this.saveButton = $("#project-rename-save");
  this.renameButton = $("#navbar-rename-project");
  this.titleBar = new InputField(this.container, true);
  this.titleBar.id = "project-title";
  this.titleBar.val(Project.getTitle());
  this.fs = Bramble.getFileSystem();

  this.container.one("click", function(e) {
    e.stopPropagation();
    e.preventDefault();
    rename(context);
  });
}

function init(appUrl, csrfToken, publisher) {
  return new ProjectRenameUtility(appUrl, csrfToken, publisher);
}

module.exports = {
  init: init
};
