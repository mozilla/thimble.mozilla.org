define(function(require) {

  var $ = require("jquery");
  var PopupMenu = require("fc/bramble-popupmenu");
  var analytics = require("analytics");

  function setupUserMenu() {
    PopupMenu.create("#navbar-logged-in .dropdown-toggle", "#navbar-logged-in .dropdown-content");
  }

  function setupLocaleMenu() {
    PopupMenu.create("#navbar-locale .dropdown-toggle", "#navbar-locale .dropdown-content");
  }

  function setupOptionsMenu(bramble) {
    // Gear Options menu
    PopupMenu.createWithOffset("#editor-pane-nav-options", "#editor-pane-nav-options-menu");

    // Font size
    $("#editor-pane-nav-decrease-font").click(function() {
      bramble.decreaseFontSize(function() {
        var fontSize = bramble.getFontSize();
        analytics.event("DecreaseFontSize", {label: "Decreased font size to " + fontSize});
      });
    });

    $("#editor-pane-nav-increase-font").click(function() {
      bramble.increaseFontSize(function() {
        var fontSize = bramble.getFontSize();
        analytics.event("IncreaseFontSize", {label: "Increased font size to " + fontSize});
      });
    });


    // Word Wrap toggle
    function setWordWrapUI(value) {
      if(value) {
        $("#line-wrap-toggle").addClass("switch-enabled");
      } else {
        $("#line-wrap-toggle").removeClass("switch-enabled");
      }
    }
    function setWordWrap(value) {
      var method = value ? "enableWordWrap" : "disableWordWrap";
      bramble[method](function() {
        setWordWrapUI(value);
        analytics.event(method);
      });
    }
    $("#line-wrap-toggle").click(function() {
      // Toggle current value
      setWordWrap(!bramble.getWordWrap());
      return false;
    });
    // Set initial UI value to match editor value
    setWordWrapUI(bramble.getWordWrap());


    // Enable/Disable JavaScript in Preview
    $("#allow-scripts-toggle").click(function() {
      // Toggle current value
      var $allowScriptsToggle = $("#allow-scripts-toggle");
      var toggle = !($allowScriptsToggle.hasClass("switch-enabled"));

      if(toggle) {
        $allowScriptsToggle.addClass("switch-enabled");
        bramble.enableJavaScript();
        analytics.event("EnableJavaScript");
      } else {
        $allowScriptsToggle.removeClass("switch-enabled");
        bramble.disableJavaScript();
        analytics.event("DisableJavaScript");
      }

      return false;
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
        left: 35
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
        left: 2
      },transitionSpeed);
    }

    function setTheme(theme) {
      if(theme === "light-theme") {
        bramble.useLightTheme();
        lightThemeUI();
        analytics.event("LightTheme");
      } else if(theme === "dark-theme") {
        bramble.useDarkTheme();
        darkThemeUI();
        analytics.event("DarkTheme");
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

    // If the user explicitly set the light-theme last time, use that
    // otherwise default to using the dark-theme.
    if(bramble.getTheme() === "light-theme") {
      setTheme("light-theme");
    } else {
      setTheme("dark-theme");
    }
  }

  function setupAddFileMenu(bramble) {
    var $addHtml = $("#filetree-pane-nav-add-html");
    var $addCss = $("#filetree-pane-nav-add-css");
    var $addJs = $("#filetree-pane-nav-add-js");
    var $addUpload = $("#filetree-pane-nav-add-upload");
    var $addTutorial = $("#filetree-pane-nav-add-tutorial");

    // Add File button and popup menu
    var menu = PopupMenu.createWithOffset("#filetree-pane-nav-add", "#filetree-pane-nav-add-menu");

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
      downloadFileToFilesystem("/default-files/html.txt", options, function(err) {
        if (err) {
          console.log("[Brackets] Failed to insert default HTML file", err);
        }
        analytics.event("AddHTMLFile");
      });
    });
    $addCss.click(function() {
      var options = {
        basenamePrefix: "style",
        ext: ".css"
      };
      downloadFileToFilesystem("/default-files/css.txt", options, function(err) {
        if (err) {
          console.log("[Brackets] Failed to insert default CSS file", err);
        }
        analytics.event("AddCSSFile");
      });
    });
    $addJs.click(function() {
      var options = {
        basenamePrefix: "script",
        ext: ".js"
      };
      downloadFileToFilesystem("/default-files/js.txt", options, function(err) {
        if (err) {
          console.log("[Brackets] Failed to insert default JS file", err);
        }
        analytics.event("AddJSFile");
      });
    });
    $addTutorial.click(function() {
      downloadFileToFilesystem("/tutorial/tutorial.html", {filename: "tutorial.html"}, function(err) {
        if (err) {
          console.log("[Brackets] Failed to insert tutorial.html", err);
        }
        analytics.event('AddTutorial');
      });
    });

    $addUpload.click(function() {
      menu.close();
      bramble.showUploadFilesDialog();
      analytics.event("ShowUploadFilesDialog");
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
    setupUserMenu();
    setupLocaleMenu();
  }

  return {
    init: init
  };
});
