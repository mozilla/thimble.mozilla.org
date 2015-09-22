define(function(require) {
  var $ = require("jquery");
  var Publisher = require("fc/publisher");
  var KeyHandler = require("fc/bramble-keyhandler");
  var BrambleMenus = require("fc/bramble-menus");
  var Underlay = require("fc/bramble-underlay");
  var Path = Bramble.Filer.Path;
  var Project = require("project");

  var _escKeyHandler;

  function updateLayout(data) {
    $(".filetree-pane-nav").width(data.sidebarWidth);
    $(".editor-pane-nav").width(data.firstPaneWidth);
    $(".preview-pane-nav").width(data.secondPaneWidth);
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
        $(".filetree-pane-nav").css("display", "block");
      }
    }

    function showFileState() {
      if(sync) {
        $("#navbar-save-indicator").removeClass("hide");
      }
    }

    // *******EVENTS
    // User bar menu help
    $("#navbar-help").click(function() {
      window.open("https://support.mozilla.org/en-US/products/webmaker/thimble");
    });

    $("#new-project-link").click(function(e) {
      e.preventDefault();
      e.stopPropagation();

      var queryString = window.location.search;
      var cacheBust = "cacheBust=" + Date.now();
      queryString = queryString === "" ? "?" + cacheBust : queryString + "&" + cacheBust;
      window.location.href = "/projects/new"  + queryString;
    });
    $('#delete-project-link').click(function() {
      var projectId = Project.getID();

      // TODO: we can do better than this, but let's at least make it harder to lose data.
      if(!window.confirm("OK to Delete this project?")) {
        return false;
      }

      var request = $.ajax({
        headers: {
          "X-Csrf-Token": $("meta[name='csrf-token']").attr("content")
        },
        type: "DELETE",
        url: "/projects/" + projectId
      });
      request.done(function() {
        if(request.status !== 204) {
          console.error("[Thimble error] sending delete request for project ", projectId, request.status);
        } else {
          var queryString = window.location.search;
          window.location.href = '/projects' + queryString;
        }
      });
      request.fail(function(jqXHR, status, err) {
        console.error('[Bramble] Delete project request failed', err);
      });
    });

    $("#export-project-zip").click(function() {
      bramble.export();
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

      publisher = new Publisher(options);
      publisher.init();
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
        $(".filetree-pane-nav").css("display", "block");
      }
      else if(data.visible === false)
      {
        $("#editor-pane-nav-options-menu").hide();
        $("#editor-pane-nav-fileview").css("display", "block");
        $(".filetree-pane-nav").css("display", "none");
      }
    });

    bramble.on("activeEditorChange", function(data) {
      console.log("thimble side", "activeEditorChange", data);
      setNavFilename(data.filename);
    });

    // File Change Events
    bramble.on("fileChange", function(filename) {
      console.log("thimble side", "fileChange", filename);
      showFileState();
    });

    bramble.on("fileDelete", function(filename) {
      console.log("thimble side", "fileDelete", filename);
      showFileState();
    });

    bramble.on("fileRename", function(oldFilename, newFilename) {
      console.log("thimble side", "fileRename", oldFilename, newFilename);
      setNavFilename(Path.basename(newFilename));
      showFileState();
    });

    $("#spinner-container").fadeOut();
  }

  return {
    init: init
  };
});
