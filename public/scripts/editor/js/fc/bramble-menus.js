define(function(require) {

  var $ = require("jquery");
  var PopupMenu = require("fc/bramble-popupmenu");

  function setupOptionsMenu(bramble) {
    // Gear Options menu
    PopupMenu.create("#editor-pane-nav-options", "#editor-pane-nav-options-menu");

    // Font size
    $("#editor-pane-nav-decrease-font").click(function() {
      bramble.decreaseFontSize();
    });

    $("#editor-pane-nav-increase-font").click(function() {
      bramble.increaseFontSize();
    });

    // Theme Toggle
    function setTheme(theme) {
      if(theme === "light-theme") {
        bramble.useLightTheme();

        // Icons
        $("#sun-green").fadeIn(500);
        $("#moon-white").fadeIn(500);
        $("#sun-white").fadeOut(500);
        $("#moon-green").fadeOut(500);

        // Active Indicator
        $("#theme-active").css("position", "absolute").animate({
          left: 187
        });
      } else if(theme === "dark-theme") {
        bramble.useDarkTheme();

        // Icons
        $("#moon-green").fadeIn(1000);
        $("#sun-white").fadeIn(1000);
        $("#moon-white").fadeOut(1000);
        $("#sun-green").fadeOut(1000);

        // Active indicator
        $("#theme-active").css("position", "absolute").animate({
          left: 157
        });
      }
    }
    function toggleTheme() {
      if(bramble.getTheme() === "dark-theme") {
        setTheme("light-theme");
      } else {
        setTheme("dark-theme");
      }
    }
    $("#theme-light").click(toggleTheme);
    $("#theme-dark").click(toggleTheme);

    var previousTheme = bramble.getTheme();
    if(previousTheme) {
      setTheme(previousTheme);
    }
  }

  function setupAddFileMenu(bramble) {
    var $addHtml = $("#filetree-pane-nav-add-html");
    var $addCss = $("#filetree-pane-nav-add-css");
    var $addJs = $("#filetree-pane-nav-add-js");
    var $addUpload = $("#filetree-pane-nav-add-upload");
    var $addTutorial = $("#filetree-pane-nav-add-tutorial");

    // Add File button and popup menu
    var menu = PopupMenu.create("#filetree-pane-nav-add", "#filetree-pane-nav-add-menu");

    function addFileType(type) {
      menu.close();
      bramble.addNewFile(type);
    }

    function downloadFileToFilesystem(location, localPath, callback) {
      callback = callback || function noop() {};

      return $.get(location)
      .then(function(data) {
        bramble.addNewFileWithContents(localPath, data, function(err) {
          if (err) {
            console.error("[Bramble] Failed to write " + localPath, err);
            callback(err);
            return;
          }
          callback();
        });
      }, function(err) {
        if (err) {
          console.error("[Bramble] Failed to download " + location, err);
          callback(err);
          return;
        }
        callback();
      });
    }

    $addHtml.click(function() {
      addFileType("html");
    });
    $addCss.click(function() {
      addFileType("css");
    });
    $addJs.click(function() {
      addFileType("js");
    });
    $addTutorial.click(function() {
      // TODO: We should probably add a loading indicator here
      menu.close();
      downloadFileToFilesystem('/tutorial/tutorial.html', '/tutorial.html', function(err) {
        // TODO: The load is finished here
        if (err) {
          console.log("[Brackets] Failed to insert tutorial.html", err);
        }
      });
    });

    $addUpload.click(function() {
      menu.close();
      bramble.showUploadFilesDialog();
    });

    // We hide the add tutorial button if a tutorial exists
    if(bramble.getTutorialExists()) {
      $addTutorial.addClass("hide");
    }

    // And listen for the user adding or removing a tutorial file
    bramble.on("tutorialAdded", function() {
      $addTutorial.addClass("hide");
    });
    bramble.on("tutorialRemoved", function() {
      $addTutorial.removeClass("hide");
    });
  }

  function init(bramble) {
    setupOptionsMenu(bramble);
    setupAddFileMenu(bramble);
  }

  return {
    init: init
  };
});
