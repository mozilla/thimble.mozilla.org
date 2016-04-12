define(function(require) {
  var $ = require("jquery");
  var Publisher = require("fc/publisher");
  var KeyHandler = require("fc/bramble-keyhandler");
  var BrambleMenus = require("fc/bramble-menus");
  var Underlay = require("fc/bramble-underlay");
  var FileSystemSync = require("fc/filesystem-sync");
  var Project = require("project/project");
  var analytics = require("analytics");

  var _escKeyHandler;

  function updateLayout(data) {
    $(".filetree-pane-nav").width(data.sidebarWidth);
    $(".editor-pane-nav").width(data.firstPaneWidth);
    $(".preview-pane-nav").width(data.secondPaneWidth);
  }

  function init(bramble) {
    var publisher;
    var locale = $("html")[0].lang;

    // *******ON LOAD
    checkIfMultiFile();
    if(bramble.getLayout())       {updateLayout(bramble.getLayout());}
    if(bramble.getFilename())     {setNavFilename(bramble.getFilename());}
    if(bramble.getPreviewMode())  {activatePreviewMode(bramble.getPreviewMode());}

    //Show sidebar nav if it is present on load
    function checkIfMultiFile() {
      var data = bramble.getLayout();

      if(data.sidebarWidth > 0) {
        // Total width of window
        var total = data.sidebarWidth + data.firstPaneWidth + data.secondPaneWidth;

        // Set width in percent, easier for window resize
        $(".filetree-pane-nav").width(((data.sidebarWidth / total) * 100) + "%");
        $(".editor-pane-nav").width(((data.firstPaneWidth / total) * 100) + "%");
        $(".preview-pane-nav").width(((data.secondPaneWidth / total) * 100) + "%");

        $("#editor-pane-nav-options-menu").hide();
        $("#editor-pane-nav-fileview").hide();
        $(".filetree-pane-nav").css("display", "block");
      }
    }

    // *******EVENTS
    // User bar menu help
    $("#navbar-help").click(function() {
      window.open("https://support.mozilla.org/" + locale + "/products/webmaker/thimble");
    });

    $("#new-project-link").click(function(e) {
      e.preventDefault();
      e.stopPropagation();

      analytics.event("NewProject", {label: "New authenticated project"});

      var queryString = window.location.search;
      var cacheBust = "cacheBust=" + Date.now();
      queryString = queryString === "" ? "?" + cacheBust : queryString + "&" + cacheBust;
      window.location.href = "/" + locale + "/projects/new"  + queryString;
    });
    $("#delete-project-link").click(function() {
      var projectId = Project.getID();

      // TODO: we can do better than this, but let's at least make it harder to lose data.
      if(!window.confirm("{{ deleteProjectConfirmText }}")) {
        return false;
      }

      analytics.event("DeleteProject");

      var request = $.ajax({
        headers: {
          "X-Csrf-Token": $("meta[name='csrf-token']").attr("content")
        },
        type: "DELETE",
        url: "/" + locale + "/projects/" + projectId
      });
      request.done(function() {
        if(request.status !== 204) {
          console.error("[Thimble error] sending delete request for project ", projectId, request.status);
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
      analytics.event("ExportZip");
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
    BrambleMenus.init(bramble);

    // Undo
    $("#editor-pane-nav-undo").click(function() {
      bramble.undo();
      analytics.event("Undo");
    });

    // Redo
    $("#editor-pane-nav-redo").click(function() {
      bramble.redo();
      analytics.event("Redo");
    });

    // Inspector
    var _inspectorEnabled = false;
    function setInspector(value) {
      if(value) {
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
      if(data.enabled) {
        $("#preview-pane-nav-inspector").addClass("enabled");
        analytics.event("InspectorEnabled");
      } else {
        $("#preview-pane-nav-inspector").removeClass("enabled");
        analytics.event("InspectorDisabled");
      }

      _inspectorEnabled = data.enabled;
    });

    // Preview auto-refresh toggle
    $(".toggle-auto-update").on("click", function() {
      var refreshWrapper = $(".refresh-wrapper");
      var enabled = refreshWrapper.hasClass("enabled");
      if(enabled) {
        refreshWrapper.removeClass("enabled");
        bramble.disableAutoUpdate();
        analytics.event("disableAutoUpdate");
      } else {
        refreshWrapper.addClass("enabled");
        bramble.enableAutoUpdate();
        analytics.event("enableAutoUpdate");
      }
    });

    // Refresh Preview
    $("#preview-pane-nav-refresh").click(function() {
      var el = $(this);
      el.removeClass("spin").width(el.width()).addClass("spin");
      bramble.refreshPreview();
      analytics.event("RefreshPreview");
    });

    // Refresh Preview
    $("#preview-pane-nav-refresh").click(function() {
      bramble.refreshPreview();
      analytics.event("RefreshPreview");
    });

    // Preview vs. Tutorial preview mode. First check to see if there
    // is a tutorial.html file, and only show the TUTORIAL link if there is.
    if(bramble.getTutorialExists()) {
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

      analytics.event("NormalPreview", {label: "User switched to normal preview mode vs. tutorial"});
    }

    function setTutorialPreview() {
      $("#preview-title").removeClass("preview-title-highlighted");
      $("#tutorial-title").addClass("preview-title-highlighted");

      analytics.event("TutorialPreview", {label: "User switched to tutorial mode vs. preview"});
    }

    // User change to tutorial vs. regular preview mode
    $("#preview-title").click(function() {
      if(!bramble.getTutorialVisible()) {
        return;
      }

      bramble.hideTutorial(setNormalPreview);
    });
    $("#tutorial-title").click(function() {
      if(bramble.getTutorialVisible()) {
        return;
      }

      bramble.showTutorial(setTutorialPreview);
    });

    // Programmatic change to tutorial vs. regular preview mode from Bramble
    bramble.on("tutorialVisibilityChange", function(data) {
      if(data.visibility) {
        setTutorialPreview();
      } else {
        setNormalPreview();
      }
    });


    // Preview Mode Toggle
    $("#preview-pane-nav-desktop").click(function() {
      activatePreviewMode("desktop");
    });
    $("#preview-pane-nav-phone").click(function() {
      activatePreviewMode("mobile");
    });

    function activatePreviewMode(mode) {
      if(mode === "mobile") {
        bramble.useMobilePreview();

        $("#preview-pane-nav-phone").removeClass("viewmode-inactive");
        $("#preview-pane-nav-phone").addClass("viewmode-active");

        $("#preview-pane-nav-desktop").removeClass("viewmode-active");
        $("#preview-pane-nav-desktop").addClass("viewmode-inactive");

        analytics.event("MobilePreview");
      } else if (mode === "desktop") {
        bramble.useDesktopPreview();

        $("#preview-pane-nav-desktop").removeClass("viewmode-inactive");
        $("#preview-pane-nav-desktop").addClass("viewmode-active");

        $("#preview-pane-nav-phone").removeClass("viewmode-active");
        $("#preview-pane-nav-phone").addClass("viewmode-inactive");

        analytics.event("DesktopPreview");
      }
    }

    $(".fullscreen-preview-toggle .enable-fullscreen").click(function() {
      enableFullscreenPreview();
    });

    $(".fullscreen-preview-toggle .disable-fullscreen").click(function() {
      disableFullscreenPreview();
    });

    function enableFullscreenPreview(){
      $("body").addClass("fullscreen-preview");
      analytics.event("FullscreenPreviewOn");
      // In case it's on, turn off the inspector
      bramble.disableInspector();
      bramble.enableFullscreenPreview();
    }

    function disableFullscreenPreview(){
      $("body").removeClass("fullscreen-preview");
      analytics.event("FullscreenPreviewOff");
      bramble.disableFullscreenPreview();
    }

    var publishDialogUnderlay;
    function hidePublishDialog() {
      publishDialogUnderlay.remove();
      publishDialogUnderlay = null;

      $("#publish-dialog").fadeOut();
      _escKeyHandler.stop();
      _escKeyHandler = null;
    }
    function showPublishDialog() {
      publishDialogUnderlay = new Underlay("#publish-dialog", hidePublishDialog);
      $("#publish-dialog").fadeIn();

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

      analytics.event("Publish");
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

      publisher = new Publisher();
      publisher.init(bramble);
    } else {
      $("#navbar-publish-button").click(showPublishHelper);
    }

    //Change file name in editor nav
    function setNavFilename(filename) {
      var fullFilename = filename;
      // Trim name to acceptable length if too long
      if(filename.length > 18) {
        filename = filename.substring(0,7) + "..." + filename.substring(filename.length-8,filename.length);
      }
      $("#editor-pane-nav-filename").text(filename);
      $("#editor-pane-nav-filename").attr("title", fullFilename);
    }

    // Hook up event listeners
    bramble.on("layout", updateLayout);

    bramble.on("sidebarChange", function(data) {
      // Open/close filetree nav during hidden double click
      if(data.visible) {
        $("#editor-pane-nav-options-menu").hide();
        $("#editor-pane-nav-fileview").css("display", "none");
        $(".filetree-pane-nav").css("display", "block");

        analytics.event("ShowSidebar");
      } else {
        $("#editor-pane-nav-options-menu").hide();
        $("#editor-pane-nav-fileview").css("display", "block");
        $(".filetree-pane-nav").css("display", "none");

        analytics.event("HideSidebar");
      }
    });

    bramble.on("activeEditorChange", function(data) {
      setNavFilename(data.filename);
    });

    $("#spinner-container").fadeOut();
  }

  return {
    init: init
  };
});
