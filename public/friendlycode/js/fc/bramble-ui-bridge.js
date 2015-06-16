define(["jquery"], function($) {
  
/**
undo() - undo the last operation in the editor (waits for focus)
redo() - redo the last operation that was undone in the editor (waits for focus)
increaseFontSize() - increases the editor's font size
decreaseFontSize() - decreases the edtior's font size
restoreFontSize() - restores the editor's font size to normal
save() - saves the current document
saveAll() - saves all "dirty" documents
useHorizontalSplitView() - splits the editor and preview horizontally
useVerticalSplitView() - splits the editor and preview vertically (default)
find() - opens the Find dialog to search within the current document
findInFiles() - opens the Find in Files dialog to search in all project files
replace() - opens the Replace dialog to replace text in the current document
replaceInFiles() - opens the Replace In Files dialog to replace text in all project files
useLightTheme() - sets the editor to use the light theme (default)
useDarkTheme() - sets the editor to use the dark theme
showSidebar() - opens the file tree sidebar
hideSidebar() - hides the file tree sidebar
showStatusbar() - enables and shows the statusbar
hideStatusbar() - disables and hides the statusbar
refreshPreview() - reloads the preview with the latest content in the editor and filesystem
useMobilePreview() - uses a Mobile view in the preview, as it would look on a smartphone
useDesktopPreview() - uses a Desktop view in the preview, as it would look on a desktop computer (default)
enableJavaScript() - turns on JavaScript execution for the preview (default)
disableJavaScript() - turns off JavaScript execution for the preview
**/

  function init(bramble) {

    // Smooths resize
    $(window).resize(function() {
      $("#editor-pane-nav-options-menu").hide();
    });

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


    // Undo
    $("#editor-pane-nav-undo").click(function() {
      bramble.undo();
    });

    // Redo
    $("#editor-pane-nav-redo").click(function() {
      bramble.redo();
    });

    // Options menu
    $("#editor-pane-nav-options").click(function() {
      var leftOffset = $("#editor-pane-nav-options").offset().left - 86;
      $("#editor-pane-nav-options-menu").css("left", leftOffset);
      $("#editor-pane-nav-options-menu").fadeToggle();
    });

    // Font size
    $("#editor-pane-nav-decrease-font").click(function() {
      bramble.decreaseFontSize();
    });

    $("#editor-pane-nav-increase-font").click(function() {
      bramble.increaseFontSize();
    });

    // Theme change
    $("#theme-dark").click(function() {
      bramble.useDarkTheme();

      $("#theme-active").css("position", "absolute").animate({
        left: 157
      });
    });

    $("#theme-light").click(function() {
      bramble.useLightTheme();

      $("#theme-active").css("position", "absolute").animate({
        left: 188
      });
    });

    // Refresh Preview
    $("#preview-pane-nav-refresh").click(function() {
      bramble.refreshPreview();
    });

    // Desktop Preview Mode
    $("#preview-pane-nav-desktop").click(function() {
      bramble.useDesktopPreview();

      $("#preview-pane-nav-desktop").removeClass("viewmode-inactive");
      $("#preview-pane-nav-desktop").addClass("viewmode-active");

      $("#preview-pane-nav-phone").removeClass("viewmode-active");
      $("#preview-pane-nav-phone").addClass("viewmode-inactive");
    });

    // Mobile Preview Mode
    $("#preview-pane-nav-phone").click(function() {
      bramble.useMobilePreview();

      $("#preview-pane-nav-phone").removeClass("viewmode-inactive");
      $("#preview-pane-nav-phone").addClass("viewmode-active");

      $("#preview-pane-nav-desktop").removeClass("viewmode-active");
      $("#preview-pane-nav-desktop").addClass("viewmode-inactive");
    });

    // Hook up event listeners
    bramble.on("layout", function(data) {
      // Calculate total width of brackets
      var total = data.sidebarWidth + data.firstPaneWidth + data.secondPaneWidth;

      // Set width in percent, easier for window resize
      $(".filetree-pane-nav").width(((data.sidebarWidth / total) * 100) + "%");
      $(".editor-pane-nav").width(((data.firstPaneWidth / total) * 100) + "%");
      $(".preview-pane-nav").width(((data.secondPaneWidth / total) * 100) + "%");

      console.log("thimble side", "layout", data);
    });

    bramble.on("previewModeChange", function(data) {
      console.log("thimble side", "previewModeChange", data);
    });

    bramble.on("sidebarChange", function(data) {
      console.log("thimble side", "sidebarChange", data);
    });

    bramble.on("activeEditorChange", function(data) {
      console.log("thimble side", "activeEditorChange", data);
    });
  }

  return {
    init: init
  };
});
