/* globals $: true */
var $ = require("jquery");
var strings = require("strings");

var Publisher = require("./publisher");
var ProjectRenameUtility = require("./project-rename");
var Menus = require("./menus");
var Project = require("../project");
var FileSystemSync = require("../filesystem-sync");
var Startup = require("../lib/startup");
var KeyHandler = require("../../../shared/scripts/keyhandler");
var Underlay = require("../../../shared/scripts/underlay");
var analytics = require("../../../shared/scripts/analytics");

var Path = Bramble.Filer.Path;

var _escKeyHandler;

var adapting = false;
var adaptTimeoutMS = 200; // How often we adapt editor bar layout
var adaptTimeout;

function updateLayout(data) {
  // If we are in fullscreen mode, we skip all this updating.
  var isFullscreen = $("body").hasClass("fullscreen-preview");
  if (isFullscreen) {
    return;
  }

  $(".filetree-pane-nav").width(data.sidebarWidth);
  $(".editor-pane-nav").width(data.firstPaneWidth);
  $(".preview-pane-nav").width(data.secondPaneWidth);

  window.clearTimeout(adaptTimeout);
  adaptTimeout = setTimeout(function() {
    adaptLayout();
  }, adaptTimeoutMS);

  if (!adapting) {
    adapting = true;
    adaptLayout();
    window.clearTimeout(adaptTimeout);
    setTimeout(function() {
      adapting = false;
    }, adaptTimeoutMS);
  }
}

// Adapt each of the pane header elements
function adaptLayout() {
  $(".nav-container").each(function() {
    adaptElement($(this));
  });
}

// Checks if there is enough room for all of the elements inside it
// Adds a 'narrow' class, in priority order, when there isn't.
function adaptElement(el) {
  var itemCount = el.find("[data-adapt-order]").addClass("narrow").length;

  for (var i = itemCount; i > 0; i--) {
    var item = el.find("[data-adapt-order=" + i + "]");
    item.removeClass("narrow");
    if (!hasEnoughRoom(el)) {
      item.addClass("narrow");
    }
  }
}

// Checks if the current element has enough room for everything in it
// by checking if the last visible element is too far to the right.
function hasEnoughRoom(el) {
  var maxRight =
    el[0].getBoundingClientRect().width - parseInt(el.css("padding-left"));

  // Finds the last visible first-order child
  var lastEl = false;
  el.find("> *").each(function() {
    if ($(this).is(":visible")) {
      lastEl = $(this);
    }
  });

  if (lastEl) {
    var parentLeft = el[0].getBoundingClientRect().left;
    var lastElBounds = lastEl[0].getBoundingClientRect();
    var lastElLeft = lastElBounds.left - parentLeft;
    var lastElWidth = lastElBounds.width;
    var lastElRight = lastElLeft + lastElWidth;

    return Math.round(lastElRight) <= Math.round(maxRight);
  } else {
    return true;
  }
}

function init(bramble, csrfToken, appUrl) {
  var publisher;
  var locale = $("html")[0].lang;

  // *******ON LOAD
  checkIfMultiFile();
  if (bramble.getLayout()) {
    updateLayout(bramble.getLayout());
  }
  if (bramble.getFilename()) {
    setNavFilename(bramble.getFilename());
  }
  if (bramble.getPreviewMode()) {
    activatePreviewMode(bramble.getPreviewMode());
  }

  //Show sidebar nav if it is present on load
  function checkIfMultiFile() {
    var data = bramble.getLayout();

    if (data.sidebarWidth > 0) {
      // Total width of window
      var total =
        data.sidebarWidth + data.firstPaneWidth + data.secondPaneWidth;

      // Set width in percent, easier for window resize
      $(".filetree-pane-nav").width(data.sidebarWidth / total * 100 + "%");
      $(".editor-pane-nav").width(data.firstPaneWidth / total * 100 + "%");
      $(".preview-pane-nav").width(data.secondPaneWidth / total * 100 + "%");

      $("#editor-pane-nav-options-menu").hide();
      $("#editor-pane-nav-fileview").hide();
      $(".filetree-pane-nav").css("display", "block");
    }
  }

  // *******EVENTS
  // User bar menu help

  $("#new-project-link").click(function(e) {
    e.preventDefault();
    e.stopPropagation();

    analytics.event({
      category: analytics.eventCategories.PROJECT_ACTIONS,
      action: "New Project",
      label: "New authenticated project"
    });

    var queryString = window.location.search;
    var cacheBust = "cacheBust=" + Date.now();
    queryString =
      queryString === "" ? "?" + cacheBust : queryString + "&" + cacheBust;
    window.location.href = "/" + locale + "/projects/new" + queryString;
  });
  $("#delete-project-link").click(function() {
    var projectId = Project.getID();

    // TODO: we can do better than this, but let's at least make it harder to lose data.
    if (!window.confirm(strings.get("deleteProjectConfirmationText"))) {
      return false;
    }

    // Add label that it happened in the menu?
    analytics.event({
      category: analytics.eventCategories.PROJECT_ACTIONS,
      action: "Delete Project"
    });

    var request = $.ajax({
      headers: {
        "X-Csrf-Token": $("meta[name='csrf-token']").attr("content")
      },
      type: "DELETE",
      url: "/" + locale + "/projects/" + projectId
    });
    request.done(function() {
      if (request.status !== 204) {
        console.error(
          "[Thimble error] sending delete request for project ",
          projectId,
          request.status
        );
      } else {
        var queryString = window.location.search;
        window.location.href = "/" + locale + "/projects" + queryString;
      }
    });
    request.fail(function(jqXHR, status, err) {
      console.error("[Bramble] Delete project request failed", err);
    });
  });

  $("#export-project-zip").click(function() {
    bramble.export();
    analytics.event({
      category: analytics.eventCategories.PROJECT_ACTIONS,
      action: "Export ZIP"
    });
    return false;
  });

  // Sidebar Fileview
  $("#editor-pane-nav-fileview").click(function() {
    $("#editor-pane-nav-options-menu").hide();
    bramble.showSidebar();
    $("#editor-pane-nav-fileview").css("display", "none");
    $(".filetree-pane-nav").css("display", "block");
  });

  $("#filetree-pane-nav-hide").click(function() {
    $("#editor-pane-nav-options-menu").hide();
    bramble.hideSidebar();
    $("#editor-pane-nav-fileview").css("display", "block");
    $(".filetree-pane-nav").css("display", "none");
  });

  // Setup Add File and Gear Options menus
  Menus.init(bramble);

  // Undo
  $("#editor-pane-nav-undo").click(function() {
    bramble.undo();
    analytics.event({
      category: analytics.eventCategories.EDITOR_UI,
      action: "Undo"
    });
  });

  // Redo
  $("#editor-pane-nav-redo").click(function() {
    bramble.redo();
    analytics.event({
      category: analytics.eventCategories.EDITOR_UI,
      action: "Redo"
    });
  });

  // Inspector
  var _inspectorEnabled = false;
  function setInspector(value) {
    if (value) {
      bramble.enableInspector();
    } else {
      bramble.disableInspector();
    }
  }
  $("#preview-pane-nav-inspector").click(function() {
    setInspector(!_inspectorEnabled);
    return false;
  });
  // Also listen for state changes in the inspector from the editor
  bramble.on("inspectorChange", function(data) {
    if (data.enabled) {
      $("#preview-pane-nav-inspector").addClass("enabled");
      analytics.event({
        category: analytics.eventCategories.EDITOR_UI,
        action: "Inspector Enabled"
      });
    } else {
      $("#preview-pane-nav-inspector").removeClass("enabled");
    }

    _inspectorEnabled = data.enabled;
  });

  // Set initial auto-refresh toggle to last known setting
  if (!bramble.getAutoUpdate()) {
    $(".refresh-wrapper").removeClass("enabled");
    bramble.disableAutoUpdate();
  }

  // Preview auto-refresh toggle
  $(".toggle-auto-update").on("click", function() {
    var refreshWrapper = $(".refresh-wrapper");
    var enabled = refreshWrapper.hasClass("enabled");
    if (enabled) {
      refreshWrapper.removeClass("enabled");
      bramble.disableAutoUpdate();
      analytics.event({
        category: analytics.eventCategories.EDITOR_UI,
        action: "Auto Update Toggle",
        label: "Disabled"
      });
    } else {
      refreshWrapper.addClass("enabled");
      bramble.enableAutoUpdate();
      analytics.event({
        category: analytics.eventCategories.EDITOR_UI,
        action: "Auto Update Toggle",
        label: "Enabled"
      });
    }
  });

  // Refresh Preview
  $("#preview-pane-nav-refresh").click(function() {
    var el = $(this);
    el
      .removeClass("spin")
      .width(el.width())
      .addClass("spin");
    bramble.refreshPreview();
    analytics.event({
      category: analytics.eventCategories.EDITOR_UI,
      action: "Refresh Preview"
    });
  });

  // Preview vs. Tutorial preview mode. First check to see if there
  // is a tutorial.html file, and only show the TUTORIAL link if there is.
  if (bramble.getTutorialExists()) {
    $("#tutorial-title").removeClass("hide");
    $(".preview-tutorial-toggle").addClass("has-toggle");
  }
  // And listen for changes to the project, in terms of one being added/removed
  bramble.on("tutorialAdded", function() {
    $("#tutorial-title").removeClass("hide");
    $(".preview-tutorial-toggle").addClass("has-toggle");
  });
  bramble.on("tutorialRemoved", function() {
    $("#tutorial-title").addClass("hide");
    $(".preview-tutorial-toggle").removeClass("has-toggle");
  });

  function setNormalPreview() {
    $("#tutorial-title").removeClass("preview-title-highlighted");
    $("#preview-title").addClass("preview-title-highlighted");
  }

  function setTutorialPreview() {
    $("#preview-title").removeClass("preview-title-highlighted");
    $("#tutorial-title").addClass("preview-title-highlighted");
  }

  // User change to tutorial vs. regular preview mode
  $("#preview-title").click(function() {
    if (!bramble.getTutorialVisible()) {
      return;
    }

    bramble.hideTutorial(setNormalPreview);
    analytics.event({
      category: analytics.eventCategories.EDITOR_UI,
      action: "Tutorial Toggle",
      label: "Disabled"
    });
  });

  $("#tutorial-title").click(function() {
    if (bramble.getTutorialVisible()) {
      return;
    }

    bramble.showTutorial(setTutorialPreview);
    analytics.event({
      category: analytics.eventCategories.EDITOR_UI,
      action: "Tutorial Toggle",
      label: "Enabled"
    });
  });

  // Programmatic change to tutorial vs. regular preview mode from Bramble
  bramble.on("tutorialVisibilityChange", function(data) {
    if (data.visibility) {
      setTutorialPreview();
    } else {
      setNormalPreview();
    }
  });

  // Preview Mode Toggle
  $("#preview-pane-nav-desktop").click(function() {
    activatePreviewMode("desktop");
    analytics.event({
      category: analytics.eventCategories.EDITOR_UI,
      action: "Preview Mode Toggle",
      label: "Desktop"
    });
  });
  $("#preview-pane-nav-phone").click(function() {
    activatePreviewMode("mobile");
    analytics.event({
      category: analytics.eventCategories.EDITOR_UI,
      action: "Preview Mode Toggle",
      label: "Mobile"
    });
  });

  function activatePreviewMode(mode) {
    if (mode === "mobile") {
      bramble.useMobilePreview();

      $("#preview-pane-nav-phone").removeClass("viewmode-inactive");
      $("#preview-pane-nav-phone").addClass("viewmode-active");

      $("#preview-pane-nav-desktop").removeClass("viewmode-active");
      $("#preview-pane-nav-desktop").addClass("viewmode-inactive");
    } else if (mode === "desktop") {
      bramble.useDesktopPreview();

      $("#preview-pane-nav-desktop").removeClass("viewmode-inactive");
      $("#preview-pane-nav-desktop").addClass("viewmode-active");

      $("#preview-pane-nav-phone").removeClass("viewmode-active");
      $("#preview-pane-nav-phone").addClass("viewmode-inactive");
    }
  }

  $(".fullscreen-preview-toggle .enable-fullscreen").click(function() {
    enableFullscreenPreview();
    analytics.event({
      category: analytics.eventCategories.EDITOR_UI,
      action: "Fullscreen Preview Toggle",
      label: "Enabled"
    });
  });

  $(".fullscreen-preview-toggle .disable-fullscreen").click(function() {
    disableFullscreenPreview();
    analytics.event({
      category: analytics.eventCategories.EDITOR_UI,
      action: "Fullscreen Preview Toggle",
      label: "Disabled"
    });
  });

  function enableFullscreenPreview() {
    $("body").addClass("fullscreen-preview");
    // In case it's on, turn off the inspector
    bramble.disableInspector();
    bramble.enableFullscreenPreview();
  }

  function disableFullscreenPreview() {
    $("body").removeClass("fullscreen-preview");
    bramble.disableFullscreenPreview();
  }

  var publishDialogUnderlay;
  function hidePublishDialog() {
    publishDialogUnderlay.remove();
    publishDialogUnderlay = null;

    $("#publish-dialog").hide();
    $("#publish-dialog").removeClass("cannot-publish");

    _escKeyHandler.stop();
    _escKeyHandler = null;
  }
  function showPublishDialog() {
    publishDialogUnderlay = new Underlay("#publish-dialog", hidePublishDialog);
    $("#publish-dialog").show();

    // Listen for ESC to close
    _escKeyHandler = new KeyHandler.ESC(hidePublishDialog);

    // Force a Save All in the editor so we get the current state of the editor
    // written to disk before we sync and publish.
    FileSystemSync.saveAndSyncAll(function(err) {
      if (err) {
        console.log("[Bramble] Error saving and persisting dirty files:", err);
        return;
      }
    });

    analytics.event({
      category: analytics.eventCategories.EDITOR_UI,
      action: "Publish Dialog Opened"
    });
  }

  function showPublishHelper() {
    var el = $("#navbar-anonymous");
    el.removeClass("strobe");
    el.height(el.height());
    el.addClass("strobe");
  }

  if (Project.getUser()) {
    //Publish button
    $("#navbar-publish-button").click(showPublishDialog);
    $("#publish-button-cancel").click(hidePublishDialog);

    //Publish link
    $("#link-publish-link").click(hidePublishDialog);

    publisher = new Publisher();
    publisher.init(bramble);

    // Initialize the project name UI
    ProjectRenameUtility.init(appUrl, csrfToken, publisher);
  } else {
    $("#navbar-publish-button").click(showPublishHelper);
  }

  //Change file name in editor nav
  function setNavFilename(filename) {
    var fullFilename = filename;
    // Trim name to acceptable length if too long
    if (filename.length > 18) {
      filename =
        filename.substring(0, 7) +
        "..." +
        filename.substring(filename.length - 8, filename.length);
    }
    $("#editor-pane-nav-filename").text(filename);
    $("#editor-pane-nav-filename").attr("title", fullFilename);
  }

  // Hook up event listeners
  bramble.on("layout", updateLayout);

  bramble.on("dialogOpened", function() {
    $("body").addClass("modal-open");
  });

  bramble.on("dialogClosed", function() {
    $("body").removeClass("modal-open");
  });

  bramble.on("sidebarChange", function(data) {
    // Open/close filetree nav during hidden double click
    if (data.visible) {
      $("#editor-pane-nav-options-menu").hide();
      $("#editor-pane-nav-fileview").css("display", "none");
      $(".filetree-pane-nav").css("display", "block");
      analytics.event({
        category: analytics.eventCategories.EDITOR_UI,
        action: "Toggle File View",
        label: "Show"
      });
    } else {
      $("#editor-pane-nav-options-menu").hide();
      $("#editor-pane-nav-fileview").css("display", "block");
      $(".filetree-pane-nav").css("display", "none");
      analytics.event({
        category: analytics.eventCategories.EDITOR_UI,
        action: "Toggle File View",
        label: "Hide"
      });
    }
  });

  bramble.on("activeEditorChange", function(data) {
    setNavFilename(data.filename);
    Menus.refreshSnippets(
      Path.extname(data.filename)
        .substr(1)
        .toLowerCase()
    );
  });

  Startup.finish();
  adaptLayout();
}

module.exports = {
  init: init
};
