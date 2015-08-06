define(function(require) {
  var $ = require("jquery");
  var Publisher = require("fc/publisher");
  var KeyHandler = require("fc/bramble-keyhandler");
  var BrambleMenus = require("fc/bramble-menus");
  var Underlay = require("fc/bramble-underlay");
  var PathUtils = require("fc/path-utils");

  var _escKeyHandler;

  function updateLayout(data) {
    // Calculate total width of brackets
    var total = data.sidebarWidth + data.firstPaneWidth + data.secondPaneWidth;

    // Set width in percent, easier for window resize
    $(".filetree-pane-nav").width(((data.sidebarWidth / total) * 100) + "%");
    $(".editor-pane-nav").width(((data.firstPaneWidth / total) * 100) + "%");
    $(".preview-pane-nav").width(((data.secondPaneWidth / total) * 100) + "%");
  }

  function init(bramble, options) {
    var sync = options.sync;
    var publisher;

    // *******ON LOAD
    checkIfMultiFile();
    if(bramble.getLayout())       {updateLayout(bramble.getLayout());}
    if(bramble.getFilename())     {setNavFilename(bramble.getFilename());}
    if(bramble.getPreviewMode())  {activatePreviewMode(bramble.getPreviewMode());}

    //Show sidebar nav if it is present on load
    function checkIfMultiFile() {
      var data = bramble.getLayout();

      if(data.sidebarWidth > 0)
      {
        // Total width of window
        var total = data.sidebarWidth + data.firstPaneWidth + data.secondPaneWidth;

        // Set width in percent, easier for window resize
        $(".filetree-pane-nav").width(((data.sidebarWidth / total) * 100) + "%");
        $(".editor-pane-nav").width(((data.firstPaneWidth / total) * 100) + "%");
        $(".preview-pane-nav").width(((data.secondPaneWidth / total) * 100) + "%");

        $("#editor-pane-nav-options-menu").hide();
        $("#editor-pane-nav-fileview").hide();
        $(".filetree-pane-nav").css("display", "inline-flex");
      }
    }

    function showFileState() {
      if(sync) {
        sync.queueLength++;
        $("#navbar-save-indicator").removeClass("hide");
      }
    }

    // *******EVENTS
    // User bar menu help
    $("#navbar-help").click(function() {
      window.open("https://support.mozilla.org/en-US/products/webmaker/thimble");
    });


    // Sidebar Fileview
    $("#editor-pane-nav-fileview").click(function() {
      $("#editor-pane-nav-options-menu").hide();
      bramble.showSidebar();
      $("#editor-pane-nav-fileview").css("display", "none");
      $(".filetree-pane-nav").css("display", "inline-flex");
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
    });

    // Redo
    $("#editor-pane-nav-redo").click(function() {
      bramble.redo();
    });

    // Refresh Preview
    $("#preview-pane-nav-refresh").click(function() {
      bramble.refreshPreview();
    });


    // Preview vs. Tutorial preview mode. First check to see if there
    // is a tutorial.html file, and only show the TUTORIAL link if there is.
    if(bramble.getTutorialExists()) {
      $("#tutorial-title").removeClass("hide");
    }
    // And listen for changes to the project, in terms of one being added/removed
    bramble.on("tutorialAdded", function() {
      $("#tutorial-title").removeClass("hide");
    });
    bramble.on("tutorialRemoved", function() {
      $("#tutorial-title").addClass("hide");
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
      }
      else if (mode === "desktop") {
        bramble.useDesktopPreview();

        $("#preview-pane-nav-desktop").removeClass("viewmode-inactive");
        $("#preview-pane-nav-desktop").addClass("viewmode-active");

        $("#preview-pane-nav-phone").removeClass("viewmode-active");
        $("#preview-pane-nav-phone").addClass("viewmode-inactive");
      }
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

      publisher.fsync.saveAndSyncAll(function(err) {
        if (err) {
          console.log('[Bramble] Error saving and persisting dirty files:', err);
          return;
        }
      });
    }

    if(options.authenticated) {
      //Publish button
      $("#navbar-publish-button").click(showPublishDialog);
      $("#publish-button-cancel").click(hidePublishDialog);

      publisher = new Publisher(options);
      publisher.init(options.project);
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

    bramble.on("previewModeChange", function(data) {
      console.log("thimble side", "previewModeChange", data);
    });

    bramble.on("sidebarChange", function(data) {
      console.log("thimble side", "sidebarChange", data);

      // Open/close filetree nav during hidden double click
      if(data.visible === true)
      {
        $("#editor-pane-nav-options-menu").hide();
        $("#editor-pane-nav-fileview").css("display", "none");
        $(".filetree-pane-nav").css("display", "inline-flex");
      }
      else if(data.visible === false)
      {
        $("#editor-pane-nav-options-menu").hide();
        $("#editor-pane-nav-fileview").css("display", "block");
        $(".filetree-pane-nav").css("display", "none");
      }
    });

    bramble.on("activeEditorChange", function(data) {
      PathUtils.transformPath(bramble, data.fullPath, function(err, fullPath) {
        if(err) {
          console.error("[Thimble Error] unable to transform path", err);
          return;
        }

        console.log("activeEditorChange", fullPath);
        setNavFilename(data.filename);
      });
    });

    // File Change Events
    bramble.on("fileChange", function(filename) {
      PathUtils.transformPath(bramble, filename, function(err, fullPath) {
        if(err) {
          console.error("[Thimble Error] unable to transform path", err);
          return;
        }

        console.log("fileChange", fullPath);
        showFileState();
      });
    });

    bramble.on("fileDelete", function(filename) {
      PathUtils.transformPath(bramble, filename, function(err, fullPath) {
        if(err) {
          console.error("[Thimble Error] unable to transform path", err);
          return;
        }

        console.log("fileDelete", fullPath);
        showFileState();
      });
    });

    bramble.on("fileRename", function(oldFilename, newFilename) {
      PathUtils.transformPaths(bramble, [oldFilename, newFilename], {projectRelative: true},
        function(err, fullPaths) {
          if(err) {
            console.error("[Thimble Error] unable to transform paths", err);
            return;
          }

          var oldFilename = fullPaths[0];
          var newFilename = fullPaths[1];

          console.log("fileRename", oldFilename, newFilename);
          setNavFilename(newFilename);
          showFileState();
        });
    });
  }

  return {
    init: init
  };
});
