define(function(require) {

  var $ = require("jquery");
  var PopupMenu = require("fc/bramble-popupmenu");
  var analytics = require("analytics");
  var fileType = "HTML";

  function setupUserMenu() {
    PopupMenu.create("#navbar-logged-in .dropdown-toggle", "#navbar-logged-in .dropdown-content");
  }

  function setupLocaleMenu() {
    PopupMenu.create("#navbar-locale .dropdown-toggle", "#navbar-locale .dropdown-content");
  }

  function setupSnippetsMenu(bramble) {
    PopupMenu.createWithOffset("#editor-pane-nav-snippets", "#editor-pane-nav-snippets-menu");
    $( "#editor-pane-nav-snippets-menu header .snippet-types a" ).each(function() {
      $( this ).click(function(bramble){
        reloadSnippetsData(bramble, $(this).text());
      });
    });

    setSnippetsMenuData(bramble);
  }

  function setSnippetsMenuData(bramble) {
    var addCodeSnippet = function() {
      $(".snippet-preview a.insert-snippet:not(.bound)")
          .addClass('bound')
          .on(
            'click',
            function() { 
              var snippetID = "#" +
                $(".snippet-preview a.insert-snippet").attr("data-snippet-id");
              var snippet = $(snippetID).text();
              bramble.addCodeSnippet(
                snippet
              ); 
              return false; 
            }
          );
    }
    var click = function (id) {
      return function() { 
        $( ".snippet-preview pre.snippet-code" ).each(function() {     
          $( this ).removeClass("hide");
          if ( $( this ).attr("id") !== id ) {
            $( this ).addClass("hide");
            $(".snippet-preview a.insert-snippet").attr("data-snippet-id", id );
          }
        });
        $(id).removeClass("hide");
        addCodeSnippet();
      };
    };

    $( ".snippet-preview pre.snippet-code" ).each(function() { 
         $( this ).addClass("hide");
    });
    var firstSnippetID = ".snippet-preview pre." + fileType;
    var firstSnippet = $(firstSnippetID).first();
    firstSnippet.removeClass("hide");
    $(".snippet-preview a.insert-snippet").attr("data-snippet-id", firstSnippet.attr("id") );
    addCodeSnippet();

    $( "#editor-pane-nav-snippets-ul li" ).each(function() {     
      $( this ).click(click("preview-"+$(this).attr("id")));
    });

  }

  function reloadSnippetsData(bramble, filename) {
    fileType = filename.substring(filename.lastIndexOf('.') + 1).toUpperCase();
    $( "#editor-pane-nav-snippets-menu header .snippet-types a" ).each(function() {     
      $( this ).removeClass("active");
      if ( $( this ).text() === fileType ) {
        $( this ).addClass("active");
      }
    });
    $( "#editor-pane-nav-snippets-ul li" ).each(function() {     
      $( this ).addClass("hide");
      if ( $( this ).attr("data-type") === fileType ) {
        $( this ).removeClass("hide");
      }
    });

    setSnippetsMenuData(bramble);
  }

  function setupOptionsMenu(bramble) {
    // Gear Options menu
    PopupMenu.createWithOffset("#editor-pane-nav-options", "#editor-pane-nav-options-menu");

    // Font size
    $("#editor-pane-nav-decrease-font").click(function() {
      bramble.decreaseFontSize(function() {
        var fontSize = bramble.getFontSize();
        analytics.event({ category : analytics.eventCategories.EDITOR_UI, action : "Font Size Changed", label : "Decreased to " + fontSize });
      });
    });

    $("#editor-pane-nav-increase-font").click(function() {
      bramble.increaseFontSize(function() {
        var fontSize = bramble.getFontSize();
        analytics.event({ category : analytics.eventCategories.EDITOR_UI, action : "Font Size Changed", label : "Increased to " + fontSize });
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
      });
    }
    $("#line-wrap-toggle").click(function() {
      // Toggle current value
      setWordWrap(!bramble.getWordWrap());
      var mode = !bramble.getWordWrap() ? "Enabled" : "Disabled";
      analytics.event({ category : analytics.eventCategories.EDITOR_UI, action : "Word Wrap Toggle", label : mode });
      return false;
    });
    // Set initial UI value to match editor value
    setWordWrapUI(bramble.getWordWrap());
    //set initial UI value to allow javascript UI
    if(bramble.getAllowJavaScript()) {
        $("#allow-scripts-toggle").addClass("switch-enabled");
    } else {
        $("#allow-scripts-toggle").removeClass("switch-enabled");
    }

    //set initial UI value to SVG XML UI
    if(bramble.getOpenSVGasXML()) {
        $("#edit-SVG-toggle").addClass("switch-enabled");
    } else {
        $("#edit-SVG-toggle").removeClass("switch-enabled");
    }

    // Enable/Disable JavaScript in Preview
    $("#allow-scripts-toggle").click(function() {
      // Toggle current value
      var $allowScriptsToggle = $("#allow-scripts-toggle");
      var toggle = !($allowScriptsToggle.hasClass("switch-enabled"));

      if(toggle) {
        $allowScriptsToggle.addClass("switch-enabled");
        bramble.enableJavaScript();
        analytics.event({ category : analytics.eventCategories.EDITOR_UI, action : "Toggle JavaScript", label : "Enabled" });
      } else {
        $allowScriptsToggle.removeClass("switch-enabled");
        bramble.disableJavaScript();
        analytics.event({ category : analytics.eventCategories.EDITOR_UI, action : "Toggle JavaScript", label : "Disabled" });
      }

      return false;
    });

    //set the Autocomplete toggle to reflect whether auto-complete is enabled or disabled
    if(bramble.getAutocomplete()) {
        $("#autocomplete-toggle").addClass("switch-enabled");
    } else {
        $("#autocomplete-toggle").removeClass("switch-enabled");
    }
    // Enable/Disable Autocomplete
    $("#autocomplete-toggle").click(function() {
      // Toggle current value
      var $autocompleteToggle = $("#autocomplete-toggle");
      var toggle = !($autocompleteToggle.hasClass("switch-enabled"));

      if(toggle) {
        $autocompleteToggle.addClass("switch-enabled");
        bramble.enableAutocomplete();
      } else {
        $autocompleteToggle.removeClass("switch-enabled");
        bramble.disableAutocomplete();
      }

      return false;
    });

    //Edit SVG as XML
    $("#edit-SVG-toggle").click(function() {
      // Toggle current value
      var $editSVGToggle = $("#edit-SVG-toggle");
      var toggle = !($editSVGToggle.hasClass("switch-enabled"));

      if(toggle) {
        $editSVGToggle.addClass("switch-enabled");
        bramble.openSVGasXML();
      } else {
        $editSVGToggle.removeClass("switch-enabled");
        bramble.openSVGasImage();
      }

      return false;
    });

    //set the AutoCloseTags toggle to reflect whether auto-close tags is enabled or disabled
    if(bramble.getAutoCloseTags().whenClosing) {
      $("#auto-tags-toggle").addClass("switch-enabled");
    } else {
      $("#auto-tags-toggle").removeClass("switch-enabled");
    }

    $("#auto-tags-toggle").click(function() {
      var $autoTagsToggle = $("#auto-tags-toggle");
      var autoCloseTagsEnabled = $autoTagsToggle.hasClass("switch-enabled");

      if(autoCloseTagsEnabled) {
        $autoTagsToggle.removeClass("switch-enabled");
        bramble.configureAutoCloseTags({ whenOpening: false, whenClosing: false, indentTags: [] });
      } else {
        $autoTagsToggle.addClass("switch-enabled");
        bramble.configureAutoCloseTags({ whenOpening: true, whenClosing: true, indentTags: [] });
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
      } else if(theme === "dark-theme") {
        bramble.useDarkTheme();
        darkThemeUI();

      }
    }
    function toggleTheme() {
      if(bramble.getTheme() === "dark-theme") {
        setTheme("light-theme");
        analytics.event({ category : analytics.eventCategories.EDITOR_UI, action : "Theme Changed", label : "Light Theme" });
      } else {
        setTheme("dark-theme");
        analytics.event({ category : analytics.eventCategories.EDITOR_UI, action : "Theme Changed", label : "Dark Theme" });
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
        analytics.event({ category : analytics.eventCategories.EDITOR_UI, action : "Add File", label : "HTML" });
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
        analytics.event({ category : analytics.eventCategories.EDITOR_UI, action : "Add File", label : "CSS" });
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
        analytics.event({ category : analytics.eventCategories.EDITOR_UI, action : "Add File", label : "JS" });
      });
    });
    $addTutorial.click(function() {
      downloadFileToFilesystem("/tutorial/tutorial.html", {filename: "tutorial.html"}, function(err) {
        if (err) {
          console.log("[Brackets] Failed to insert tutorial.html", err);
        }
        analytics.event({ category : analytics.eventCategories.EDITOR_UI, action : "Add File", label : "Tutorial" });
      });
    });

    $addUpload.click(function() {
      menu.close();
      bramble.showUploadFilesDialog();
      analytics.event({ category : analytics.eventCategories.EDITOR_UI, action : "Upload File Dialog Shown"});
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
    setupSnippetsMenu(bramble);
    setupOptionsMenu(bramble);
    setupAddFileMenu(bramble);
    setupUserMenu();
    setupLocaleMenu();
  }

  return {
    init: init,
    reloadSnippetsData: reloadSnippetsData
  };
});
