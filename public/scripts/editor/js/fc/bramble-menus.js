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
    function lightThemeUI() {
      var transitionSpeed = 200;

      $("#sun-green").fadeIn(transitionSpeed);
      $("#moon-white").fadeIn(transitionSpeed);
      $("#sun-white").fadeOut(transitionSpeed);
      $("#moon-green").fadeOut(transitionSpeed);

      // Active Indicator
      $("#theme-active").css("position", "absolute").animate({
        left: 190
      }, transitionSpeed);
    }

    function darkThemeUI() {
      var transitionSpeed = 200;

      $("#moon-green").fadeIn(transitionSpeed);
      $("#sun-white").fadeIn(transitionSpeed);
      $("#moon-white").fadeOut(transitionSpeed);
      $("#sun-green").fadeOut(transitionSpeed);

      // Active indicator
      $("#theme-active").css("position", "absolute").animate({
        left: 157
      },transitionSpeed);
    }

    function setTheme(theme) {
      if(theme === "light-theme") {
        bramble.useLightTheme();
        lightThemeUI();
      } else if(theme === "dark-theme") {
        bramble.useDarkTheme();
        darkThemeUI();
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
      if(previousTheme === "light-theme") {
        lightThemeUI();
      } else if(previousTheme === "dark-theme") {
        darkThemeUI();
      }
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

    function downloadFileToFilesystem(location, fileOptions, callback) {
      callback = callback || function noop() {};

      menu.close();

      $.get(location).then(function(data) {
        fileOptions.contents = data;

        bramble.addNewFile(fileOptions, function(err) {
          if (err) {
            console.error("[Bramble] Failed to write new file", err);
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
      var options = {
        basenamePrefix: "index",
        ext: ".html"
      };
      downloadFileToFilesystem("/resources/default-files/html.txt", options, function(err) {
        if (err) {
          console.log("[Brackets] Failed to insert default HTML file", err);
        }
      });
    });
    $addCss.click(function() {
      var options = {
        basenamePrefix: "style",
        ext: ".css"
      };
      downloadFileToFilesystem("/resources/default-files/css.txt", options, function(err) {
        if (err) {
          console.log("[Brackets] Failed to insert default CSS file", err);
        }
      });
    });
    $addJs.click(function() {
      var options = {
        basenamePrefix: "script",
        ext: ".js"
      };
      downloadFileToFilesystem("/resources/default-files/js.txt", options, function(err) {
        if (err) {
          console.log("[Brackets] Failed to insert default JS file", err);
        }
      });
    });
    $addTutorial.click(function() {
      downloadFileToFilesystem("/tutorial/tutorial.html", {filename: "tutorial.html"}, function(err) {
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
