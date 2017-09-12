/* globals $: true */
var $ = require("jquery");
var strings = require("strings");

var Project = require("../project");
var FileSystemSync = require("../filesystem-sync");
var SyncState = require("../filesystem-sync/state");

var host;

var TEXT_PUBLISH = strings.get("publishBtn");
var TEXT_PUBLISHING = strings.get("publishPublishingIndicator");
var TEXT_UNPUBLISH = strings.get("publishDeleteBtn");
var TEXT_UNPUBLISHING = strings.get("publishUnpublishingIndicator");
var TEXT_UPDATE_PUBLISH = strings.get("publishChangesBtn");
var TEXT_UNPUBLISH_WARNING = strings.get("publishDeleteWarning");

function unpublishedChangesPrompt() {
  var dialog = this.dialog;
  var publish = this.handlers.publish;
  dialog.published.changed.removeClass("hide");
  dialog.buttons.update.off("click", publish).on("click", publish);
}

function Publisher() {
  host = Project.getHost();
  this.csrfToken = $("meta[name='csrf-token']").attr("content");
  this.dialog = {
    buttons: {
      publish: $("#publish-button-publish"),
      update: $("#publish-button-update"),
      unpublish: $("#publish-button-unpublish"),
      parent: $("#publish-buttons"),
      indexMessage: $("#no-index")
    },
    description: $("#publish-details > textarea.publish-description"),
    published: {
      link: $("#publish-link > a"),
      changed: $("#publish-changes"),
      container: $("#publish-live")
    }
  };
  this.dialogEl = $("#publish-dialog");
  this.button = $("#navbar-publish-button");
}

Publisher.prototype.init = function(bramble) {
  var publisher = this;
  var dialog = publisher.dialog;
  var publishUrl = Project.getPublishUrl();

  publisher.isProjectPublic = true;
  publisher.needsUpdate = false;
  publisher.handlers = {
    publish: publisher.publish.bind(publisher, bramble),
    unpublish: publisher.unpublish.bind(publisher),
    unpublishedChangesPrompt: unpublishedChangesPrompt.bind(publisher)
  };

  if (Project.getDescription()) {
    dialog.description.val(Project.getDescription());
  }

  if (publishUrl) {
    this.updateDialog(publishUrl, true);
  }

  bramble.on("fileChange", function() {
    publisher.showUnpublishedChangesPrompt();
  });
  bramble.on("fileDelete", function() {
    publisher.showUnpublishedChangesPrompt();
  });
  bramble.on("fileRename", function() {
    publisher.showUnpublishedChangesPrompt();
  });
  bramble.on("folderRename", function() {
    publisher.showUnpublishedChangesPrompt();
  });

  dialog.buttons.publish.on("click", publisher.handlers.publish);

  // Were there any files that were updated and not published?
  Project.getPublishNeedsUpdate(function(err, needsUpdate) {
    if (err) {
      console.error(
        "[Thimble] Failed to get the publishNeedsUpdate flag while loading the publish dialog: ",
        err
      );
      return;
    }

    if (needsUpdate) {
      publisher.needsUpdate = needsUpdate;
      publisher.enable();
      publisher.handlers.unpublishedChangesPrompt();
    }
  });
};

// When there are file events triggered by the editor (or project is renamed), update the publish/republish status
Publisher.prototype.showUnpublishedChangesPrompt = function(callback) {
  var publisher = this;

  callback = callback || function() {};

  if (publisher.needsUpdate) {
    callback();
    return;
  }

  if (!Project.getPublishUrl()) {
    callback();
    return;
  }

  publisher.handlers.unpublishedChangesPrompt();
  Project.publishNeedsUpdate(true, function(err) {
    if (err) {
      console.error(
        "[Thimble] Failed to set the publishNeedsUpdate flag after a file change: ",
        err
      );
      callback(err);
      return;
    }

    publisher.needsUpdate = true;
    callback();
  });
};

Publisher.prototype.publish = function(bramble) {
  var publisher = this;
  var dialog = publisher.dialog;

  if (publisher.publishing) {
    return;
  }

  if (!bramble.hasIndexFile()) {
    // This width hack lets us apply the class again in a way that
    // re-triggers the animation.
    if (publisher.dialogEl.hasClass("cannot-publish")) {
      publisher.dialogEl.removeClass("cannot-publish");
      publisher.dialogEl.width(publisher.dialogEl.width());
    }
    publisher.dialogEl.addClass("cannot-publish");
    return;
  }

  publisher.publishing = true;

  function setState(done) {
    var buttons = dialog.buttons;
    var toggle = done ? "on" : "off";

    Project.setDescription(publisher.dialog.description.val());

    publisher.togglePublishState(toggle);
    buttons.publish.text(done ? TEXT_PUBLISH : TEXT_PUBLISHING);
    buttons.update.text(done ? TEXT_UPDATE_PUBLISH : TEXT_PUBLISHING);
  }

  function run() {
    SyncState.syncing();

    var request = publisher.generateRequest("publish");
    request.done(function(project) {
      if (request.status !== 200) {
        console.error(
          "[Thimble] Server was unable to publish project, responded with status ",
          request.status
        );
        return;
      }

      publisher.updateDialog(project.link, true);
      Project.publishNeedsUpdate(false, function(err) {
        if (err) {
          console.error(
            "[Thimble] Failed to set the publishNeedsUpdate flag after publishing with: ",
            err
          );
          return;
        }

        Project.setPublishUrl(project.link);
        publisher.needsUpdate = false;
      });
    });
    request.fail(function(jqXHR, status, err) {
      console.error(
        "[Thimble] Failed to send request to publish project to the server with: ",
        err
      );
    });
    request.always(function() {
      SyncState.completed();
      publisher.publishing = false;
      setState(true);
    });
  }

  setState(false);

  FileSystemSync.saveAndSyncAll(function(err) {
    if (err) {
      console.error("[Thimble] Failed to publish project");
      setState(true);
      return;
    }

    run();
  });
};

Publisher.prototype.unpublish = function() {
  var publisher = this;
  var handlers = publisher.handlers;
  var dialog = publisher.dialog;
  var buttons = dialog.buttons;

  if (publisher.unpublishing) {
    return;
  }

  var didConfirm = window.confirm(TEXT_UNPUBLISH_WARNING);

  if (!didConfirm) {
    return;
  }

  publisher.unpublishing = true;

  function setState(done) {
    buttons.publish[done ? "on" : "off"]("click", handlers.publish);
    buttons.unpublish
      .children("span")
      .text(done ? TEXT_UNPUBLISH : TEXT_UNPUBLISHING);
  }

  // Disable all actions during the unpublish
  buttons.unpublish.off("click", handlers.unpublish);
  setState(false);
  SyncState.syncing();

  var request = publisher.generateRequest("unpublish");
  request.done(function() {
    if (request.status !== 200) {
      console.error(
        "[Thimble] Server was unable to unpublish project, responded with status ",
        request.status
      );
      buttons.unpublish.on("click", handlers.unpublish);
      return;
    }

    buttons.parent.removeClass("hide");

    publisher.updateDialog("");

    Project.publishNeedsUpdate(false, function(err) {
      if (err) {
        console.error(
          "[Thimble] Failed to set the publishNeedsUpdate flag after unpublishing with: ",
          err
        );
        return;
      }

      Project.setPublishUrl(null);
      publisher.needsUpdate = false;
    });
  });
  request.fail(function(jqXHR, status, err) {
    console.error(
      "[Thimble] Failed to send request to unpublish project to the server with: ",
      err
    );
    buttons.unpublish.on("click", handlers.unpublish);
  });
  request.always(function() {
    SyncState.completed();
    publisher.unpublishing = false;
    setState(true);
  });
};

Publisher.prototype.generateRequest = function(action) {
  var publisher = this;

  return $.ajax({
    contentType: "application/json",
    headers: {
      "X-Csrf-Token": publisher.csrfToken,
      Accept: "application/json"
    },
    type: "PUT",
    url: host + "/projects/" + Project.getID() + "/" + action,
    data: JSON.stringify({
      description: publisher.dialog.description.val() || " ",
      public: publisher.isProjectPublic,
      dateUpdated: new Date().toISOString()
    })
  });
};

Publisher.prototype.updateDialog = function(publishUrl, allowUnpublish) {
  var published = this.dialog.published;
  var unpublishBtn = this.dialog.buttons.unpublish;
  var unpublish = this.handlers.unpublish;

  // Expose the published state with the updated link
  published.link.attr("href", publishUrl).text(publishUrl);
  published.changed.addClass("hide");

  // Re-attach the unpublish handler and remove
  // "publish"/"cancel" buttons
  if (allowUnpublish) {
    this.dialog.buttons.parent.addClass("hide");
    unpublishBtn.off("click", unpublish).on("click", unpublish);
    published.container.removeClass("hide");
  } else {
    published.container.addClass("hide");
  }
};

Publisher.prototype.enable = function() {
  var buttons = this.dialog.buttons;
  buttons.publish.removeClass("disabled");
  buttons.update.removeClass("disabled");
  this.togglePublishState("on");
};

Publisher.prototype.disable = function() {
  var buttons = this.dialog.buttons;
  buttons.publish.addClass("disabled");
  buttons.update.addClass("disabled");
  this.togglePublishState("off");
};

Publisher.prototype.togglePublishState = function(state) {
  var buttons = this.dialog.buttons;
  var handlers = this.handlers;
  buttons.publish[state]("click", handlers.publish);
  buttons.update[state]("click", handlers.publish);
};

module.exports = Publisher;
