/* globals $: true */
var $ = require("jquery");

var PopupMenu = require("../../../shared/scripts/popupmenu");
var userbar = require("../../../shared/scripts/userbar");
var analytics = require("../../../shared/scripts/analytics");

function setupSnippetsMenu(bramble) {
  var menu = PopupMenu.createWithOffset(
    "#editor-pane-nav-snippets",
    ".snippets-menu-container"
  );

  function dataTypeSelector(elementSelector, dataType) {
    return elementSelector + "[data-type='" + dataType + "']";
  }

  function snippetIDSelector(elementSelector, snippetID) {
    return elementSelector + "[data-snippet-id='" + snippetID + "']";
  }

  // Clicks on the Snippet Categories (HTML/CSS/JS)
  $("div.snippets-menu .snippets-categories span").click(function() {
    var $snippetCategory = $(this);
    var $previousSnippetCategory = $snippetCategory
      .parent()
      .children(".active");

    if ($snippetCategory.is($previousSnippetCategory)) {
      return false;
    }

    // Current/previous snippet data types
    var dataType = $snippetCategory.data("type");
    var previousDataType = $previousSnippetCategory.data("type");

    // Current/previously selected snippets
    var snippetID = $(
      dataTypeSelector("ul.snippets-list li.selected", dataType)
    ).data("snippet-id");
    var previousSnippetID = $(
      dataTypeSelector("ul.snippets-list li.selected", previousDataType)
    ).data("snippet-id");

    /*
      - Hide the snippet list items for the previous data type
      - Show the snippet list items for the current data type
      - Hide the snippet preview for the previously selected snippet
      - Show the snippet preview for the currently selected snippet
    */
    $("div.snippets")
      .find(
        dataTypeSelector("li", dataType) +
          ", " +
          dataTypeSelector("li", previousDataType) +
          ", " +
          snippetIDSelector("div.snippets-preview", snippetID) +
          ", " +
          snippetIDSelector("div.snippets-preview", previousSnippetID)
      )
      .toggleClass("hide");

    $snippetCategory.toggleClass("active");
    $previousSnippetCategory.toggleClass("active");

    return false;
  });

  $("ul.snippets-list > li").click(function() {
    var $selectedSnippet = $(this);
    var $previousSnippet = $(
      dataTypeSelector(
        "ul.snippets-list li.selected",
        $selectedSnippet.data("type")
      )
    );

    var $selectedSnippetCode = $(
      snippetIDSelector(
        ".snippets-preview",
        $selectedSnippet.data("snippet-id")
      )
    );
    var $previousSnippetCode = $(
      snippetIDSelector(
        ".snippets-preview",
        $previousSnippet.data("snippet-id")
      )
    );

    $selectedSnippet.toggleClass("selected");
    $previousSnippet.toggleClass("selected");
    $selectedSnippetCode.toggleClass("hide");
    $previousSnippetCode.toggleClass("hide");

    return false;
  });

  $("div.snippets-preview > button").click(function() {
    var snippetID =
      $(this)
        .parent()
        .data("snippet-id") || false;
    if (snippetID) {
      analytics.event({
        category: analytics.eventCategories.EDITOR_UI,
        action: "Insert Snippet",
        label: snippetID
      });
    }
    bramble.addCodeSnippet(
      $(this)
        .siblings("pre")
        .text()
    );
    menu.close();

    return false;
  });
}

function setupOptionsMenu(bramble) {
  // Gear Options menu
  PopupMenu.createWithOffset(
    "#editor-pane-nav-options",
    "#editor-pane-nav-options-menu"
  );

  // Font size
  $("#editor-pane-nav-decrease-font").click(function() {
    bramble.decreaseFontSize(function() {
      var fontSize = bramble.getFontSize();
      analytics.event({
        category: analytics.eventCategories.EDITOR_UI,
        action: "Font Size Changed",
        label: "Decreased to " + fontSize
      });
    });
  });

  $("#editor-pane-nav-increase-font").click(function() {
    bramble.increaseFontSize(function() {
      var fontSize = bramble.getFontSize();
      analytics.event({
        category: analytics.eventCategories.EDITOR_UI,
        action: "Font Size Changed",
        label: "Increased to " + fontSize
      });
    });
  });

  // Word Wrap toggle
  function setWordWrapUI(value) {
    if (value) {
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
    analytics.event({
      category: analytics.eventCategories.EDITOR_UI,
      action: "Word Wrap Toggle",
      label: mode
    });
    return false;
  });
  // Set initial UI value to match editor value
  setWordWrapUI(bramble.getWordWrap());
  //set initial UI value to allow javascript UI
  if (bramble.getAllowJavaScript()) {
    $("#allow-scripts-toggle").addClass("switch-enabled");
  } else {
    $("#allow-scripts-toggle").removeClass("switch-enabled");
  }

  //set initial UI value to SVG XML UI
  if (bramble.getOpenSVGasXML()) {
    $("#edit-SVG-toggle").addClass("switch-enabled");
  } else {
    $("#edit-SVG-toggle").removeClass("switch-enabled");
  }

  // Enable/Disable JavaScript in Preview
  $("#allow-scripts-toggle").click(function() {
    // Toggle current value
    var $allowScriptsToggle = $("#allow-scripts-toggle");
    var toggle = !$allowScriptsToggle.hasClass("switch-enabled");

    if (toggle) {
      $allowScriptsToggle.addClass("switch-enabled");
      bramble.enableJavaScript();
      analytics.event({
        category: analytics.eventCategories.EDITOR_UI,
        action: "Toggle JavaScript",
        label: "Enabled"
      });
    } else {
      $allowScriptsToggle.removeClass("switch-enabled");
      bramble.disableJavaScript();
      analytics.event({
        category: analytics.eventCategories.EDITOR_UI,
        action: "Toggle JavaScript",
        label: "Disabled"
      });
    }

    return false;
  });

  //set initial UI value to allow whitespace indicator
  if (bramble.getAllowWhiteSpace()) {
    $("#allow-whitespace-toggle").addClass("switch-enabled");
  } else {
    $("#allow-whitespace-toggle").removeClass("switch-enabled");
  }
  // Enable/Disable Whitespace Indicator
  $("#allow-whitespace-toggle").click(function() {
    // Toggle current value
    var $allowWhitespaceToggle = $("#allow-whitespace-toggle");
    var toggle = !$allowWhitespaceToggle.hasClass("switch-enabled");

    if (toggle) {
      $allowWhitespaceToggle.addClass("switch-enabled");
      bramble.enableWhiteSpace();
    } else {
      $allowWhitespaceToggle.removeClass("switch-enabled");
      bramble.disableWhiteSpace();
    }

    return false;
  });

  //set the Autocomplete toggle to reflect whether auto-complete is enabled or disabled
  if (bramble.getAutocomplete()) {
    $("#autocomplete-toggle").addClass("switch-enabled");
  } else {
    $("#autocomplete-toggle").removeClass("switch-enabled");
  }
  // Enable/Disable Autocomplete
  $("#autocomplete-toggle").click(function() {
    // Toggle current value
    var $autocompleteToggle = $("#autocomplete-toggle");
    var toggle = !$autocompleteToggle.hasClass("switch-enabled");

    if (toggle) {
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
    var toggle = !$editSVGToggle.hasClass("switch-enabled");

    if (toggle) {
      $editSVGToggle.addClass("switch-enabled");
      bramble.openSVGasXML();
    } else {
      $editSVGToggle.removeClass("switch-enabled");
      bramble.openSVGasImage();
    }

    return false;
  });

  //set the AutoCloseTags toggle to reflect whether auto-close tags is enabled or disabled
  var autoCloseTags = bramble.getAutoCloseTags() || {};
  if (autoCloseTags.whenClosing) {
    $("#auto-tags-toggle").addClass("switch-enabled");
  } else {
    $("#auto-tags-toggle").removeClass("switch-enabled");
  }

  $("#auto-tags-toggle").click(function() {
    var $autoTagsToggle = $("#auto-tags-toggle");
    var autoCloseTagsEnabled = $autoTagsToggle.hasClass("switch-enabled");

    if (autoCloseTagsEnabled) {
      $autoTagsToggle.removeClass("switch-enabled");
      bramble.configureAutoCloseTags({
        whenOpening: false,
        whenClosing: false,
        indentTags: []
      });
    } else {
      $autoTagsToggle.addClass("switch-enabled");
      bramble.configureAutoCloseTags({
        whenOpening: true,
        whenClosing: true,
        indentTags: []
      });
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
    $("#theme-active")
      .css("position", "absolute")
      .animate(
        {
          left: 35
        },
        transitionSpeed
      );
  }

  function darkThemeUI() {
    var transitionSpeed = 200;

    $("#moon-green").fadeIn(transitionSpeed);
    $("#sun-white").fadeIn(transitionSpeed);
    $("#moon-white").fadeOut(transitionSpeed);
    $("#sun-green").fadeOut(transitionSpeed);

    // Active indicator
    $("#theme-active")
      .css("position", "absolute")
      .animate(
        {
          left: 2
        },
        transitionSpeed
      );
  }

  function setTheme(theme) {
    if (theme === "light-theme") {
      bramble.useLightTheme();
      lightThemeUI();
    } else if (theme === "dark-theme") {
      bramble.useDarkTheme();
      darkThemeUI();
    }
  }
  function toggleTheme() {
    if (bramble.getTheme() === "dark-theme") {
      setTheme("light-theme");
      analytics.event({
        category: analytics.eventCategories.EDITOR_UI,
        action: "Theme Changed",
        label: "Light Theme"
      });
    } else {
      setTheme("dark-theme");
      analytics.event({
        category: analytics.eventCategories.EDITOR_UI,
        action: "Theme Changed",
        label: "Dark Theme"
      });
    }
  }
  $("#theme-light").click(toggleTheme);
  $("#theme-dark").click(toggleTheme);

  // If the user explicitly set the light-theme last time, use that
  // otherwise default to using the dark-theme.
  if (bramble.getTheme() === "light-theme") {
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
  var $addFolder = $("#filetree-pane-nav-add-folder");
  var $addTutorial = $("#filetree-pane-nav-add-tutorial");
  var $downloadZip = $("#filetree-pane-nav-export-project-zip");

  // Add File button and popup menu
  var menu = PopupMenu.createWithOffset(
    "#filetree-pane-nav-add",
    "#filetree-pane-nav-add-menu"
  );

  function downloadFileToFilesystem(location, fileOptions, callback) {
    callback = callback || function noop() {};

    menu.close();

    $.get(location).then(
      function(data) {
        fileOptions.contents = data;

        bramble.addNewFile(fileOptions, function(err) {
          if (err) {
            console.error("[Bramble] Failed to write new file", err);
            callback(err);
            return;
          }
          callback();
        });
      },
      function(err) {
        if (err) {
          console.error("[Bramble] Failed to download " + location, err);
          callback(err);
          return;
        }
        callback();
      }
    );
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
      analytics.event({
        category: analytics.eventCategories.EDITOR_UI,
        action: "Add File",
        label: "HTML"
      });
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
      analytics.event({
        category: analytics.eventCategories.EDITOR_UI,
        action: "Add File",
        label: "CSS"
      });
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
      analytics.event({
        category: analytics.eventCategories.EDITOR_UI,
        action: "Add File",
        label: "JS"
      });
    });
  });
  $addTutorial.click(function() {
    downloadFileToFilesystem(
      "/tutorial/tutorial.html",
      { filename: "tutorial.html" },
      function(err) {
        if (err) {
          console.log("[Brackets] Failed to insert tutorial.html", err);
        }
        analytics.event({
          category: analytics.eventCategories.EDITOR_UI,
          action: "Add File",
          label: "Tutorial"
        });
      }
    );
  });

  $addFolder.click(function() {
    menu.close();
    bramble.addNewFolder();
    analytics.event({
      category: analytics.eventCategories.EDITOR_UI,
      action: "Add New Folder"
    });
  });

  $addUpload.click(function() {
    menu.close();
    bramble.showUploadFilesDialog();
    analytics.event({
      category: analytics.eventCategories.EDITOR_UI,
      action: "Upload File Dialog Shown"
    });
  });

  $downloadZip.click(function() {
    menu.close();
    bramble.export();
    analytics.event({
      category: analytics.eventCategories.PROJECT_ACTIONS,
      action: "Export ZIP"
    });
    return false;
  });

  // We hide the add tutorial button if a tutorial exists
  if (bramble.getTutorialExists()) {
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

function refreshSnippets(type) {
  $(
    "div.snippets-menu .snippets-categories span[data-type='" + type + "']"
  ).click();
}

function init(bramble) {
  setupSnippetsMenu(bramble);
  setupOptionsMenu(bramble);
  setupAddFileMenu(bramble);
  userbar.createDropdownMenus();
}

module.exports = {
  init: init,
  refreshSnippets: refreshSnippets
};
