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
    // Add File button and popup menu
    var menu = PopupMenu.create("#filetree-pane-nav-add", "#filetree-pane-nav-add-menu");

    function addFileType(type) {
      menu.close();
      bramble.addNewFile(type);
    }

    $("#filetree-pane-nav-add-html").click(function() {
      addFileType("html");
    });
    $("#filetree-pane-nav-add-css").click(function() {
      addFileType("css");
    });
    $("#filetree-pane-nav-add-js").click(function() {
      addFileType("js");
    });

    $("#filetree-pane-nav-add-upload").click(function() {
      menu.close();
      bramble.showUploadFilesDialog();
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
