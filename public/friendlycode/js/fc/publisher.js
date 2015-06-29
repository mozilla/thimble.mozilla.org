define(function(require) {
  var $ = require("jquery");
  var host;

  var TEXT_PUBLISH = "Publish";
  var TEXT_PUBLISHING = "Publishing...";
  var TEXT_UNPUBLISH = "Unpublish";
  var TEXT_UNPUBLISHING = "Unpublishing...";
  var TEXT_UPDATE_PUBLISH = "Update published version";

  function togglePublicVisibility() {
    var toggle = this.interface.projectVisibility;
    var ellipse = $({ cx: toggle.attr("cx") });
    var cx = 31;
    var fill = "#06a050";
    var animationOptions = {
      duration: 250,
      step: function(now) {
        toggle.attr("cx", now);
      }
    };

    this.isProjectPublic = !this.isProjectPublic;

    if(!this.isProjectPublic) {
      cx = 11;
      fill = "#7C7C7C";
    }

    ellipse.animate({ cx: cx }, animationOptions);
    toggle.css("fill", fill);
  }

  function unpublishedChangesPrompt() {
    var interface = this.interface;
    var publish = this.handlers.publish;
    interface.published.changed.removeClass("hide");
    interface.buttons.update
      .off("click", publish)
      .on("click", publish);
  }

  function Publisher(options) {
    this.fsync = options.sync;
    host = options.appUrl;
    this.csrfToken = $("meta[name='csrf-token']").attr("content");
    this.interface = {
      buttons: {
        publish: $("#publish-button-publish"),
        update: $("#publish-button-update"),
        unpublish: $("#publish-button-unpublish")
      },
      description: $("#publish-details > textarea.publish-description"),
      projectVisibility: $("#publish-public-gallery-toggle > ellipse"),
      published: {
        link: $("#publish-link > a"),
        changed: $("#publish-changes"),
        container: $("#publish-live")
      }
    };
  }

  Publisher.prototype.init = function(project) {
    var publisher = this;
    var interface = publisher.interface;
    publisher.isProjectPublic = true;
    publisher.handlers = {
      publish: publisher.publish.bind(publisher),
      unpublish: publisher.unpublish.bind(publisher),
      togglePublicVisibility: togglePublicVisibility.bind(publisher),
      unpublishedChangesPrompt: unpublishedChangesPrompt.bind(publisher)
    };

    $("#publish-public-gallery-toggle").on("click", publisher.handlers.togglePublicVisibility);

    if(project.description) {
      interface.description.val(project.description);
    }

    if(project.publishUrl) {
      this.updateDialog(project.publishUrl, true);
    }

    if(publisher.fsync) {
      publisher.fsync.beforeEach = function() {
        publisher.disable();
      };
      publisher.fsync.afterEach = function() {
        publisher.enable();
        publisher.handlers.unpublishedChangesPrompt();
      };
    }

    interface.buttons.publish.on("click", publisher.handlers.publish);
  };

  Publisher.prototype.publish = function() {
    var publisher = this;
    var interface = publisher.interface;

    function setState(done) {
      var buttons = interface.buttons;
      var toggle = done ? "on" : "off";

      publisher.togglePublishState(toggle);
      buttons.publish.text(done ? TEXT_PUBLISH : TEXT_PUBLISHING);
      buttons.update.text(done ? TEXT_UPDATE_PUBLISH : TEXT_PUBLISHING);
    }

    setState(false);

    var request = publisher.generateRequest("/publish");
    request.done(function(project) {
      if(request.status !== 200) {
        console.error("[Bramble] Server was unable to publish project, responded with status ", request.status);
        return;
      }

      publisher.updateDialog(project.link, true);
    });
    request.fail(function(jqXHR, status, err) {
      console.error("[Bramble] Failed to send request to publish project to the server with: ", err);
    });
    request.always(function() {
      setState(true);
    });
  };

  Publisher.prototype.unpublish = function() {
    var publisher = this;
    var handlers = publisher.handlers;
    var interface = publisher.interface;
    var buttons = interface.buttons;

    function setState(done) {
      buttons.publish[done ? "on" : "off"]("click", handlers.publish);
      buttons.unpublish.children("span").text(done ? TEXT_UNPUBLISH : TEXT_UNPUBLISHING);
    }

    // Disable all actions during the unpublish
    buttons.unpublish.off("click", handlers.unpublish);
    setState(false);

    var request = publisher.generateRequest("/unpublish");
    request.done(function() {
      if(request.status !== 200) {
        console.error("[Bramble] Server was unable to unpublish project, responded with status ", request.status);
        buttons.unpublish.on("click", handlers.unpublish);
        return;
      }

      publisher.updateDialog("");
    });
    request.fail(function(jqXHR, status, err) {
      console.error("[Bramble] Failed to send request to unpublish project to the server with: ", err);
      buttons.unpublish.on("click", handlers.unpublish);
    });
    request.always(function() {
      setState(true);
    });
  };

  Publisher.prototype.generateRequest = function(route) {
    var publisher = this;

    return $.ajax({
      contentType: "application/json",
      headers: {
        "X-Csrf-Token": publisher.csrfToken,
        "Accept": "application/json"
      },
      type: "PUT",
      url: host + route,
      data: JSON.stringify({
        description: publisher.interface.description.val() || " ",
        public: publisher.isProjectPublic,
        dateUpdated: (new Date()).toISOString()
      })
    });
  };

  Publisher.prototype.updateDialog = function(publishUrl, allowUnpublish) {
    var published = this.interface.published;
    var unpublishBtn = this.interface.buttons.unpublish;
    var unpublish = this.handlers.unpublish;

    // Expose the published state with the updated link
    published.link
      .attr("href", publishUrl)
      .text(publishUrl);
    published.changed.addClass("hide");

    // Re-attach the unpublish handler
    if(allowUnpublish) {
      unpublishBtn
        .off("click", unpublish)
        .on("click", unpublish);
      published.container.removeClass("hide");
    } else {
      published.container.addClass("hide");
    }
  };

  Publisher.prototype.enable = function() {
    var buttons = this.interface.buttons;
    buttons.publish.removeClass("disabled");
    buttons.update.removeClass("disabled");
    this.togglePublishState("on");
  };

  Publisher.prototype.disable = function() {
    var buttons = this.interface.buttons;
    buttons.publish.addClass("disabled");
    buttons.update.addClass("disabled");
    this.togglePublishState("off");
  };

  Publisher.prototype.togglePublishState = function(state) {
    var buttons = this.interface.buttons;
    var handlers = this.handlers;
    buttons.publish[state]("click", handlers.publish);
    buttons.update[state]("click", handlers.publish);
  };

  return Publisher;
});
