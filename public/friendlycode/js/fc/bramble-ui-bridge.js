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

    // Sidebar Fileview
    $("#editor-pane-nav-fileview").click(function() {
      bramble.showSidebar();
    });

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

    // Desktop Preview Mode
    $("#preview-pane-nav-desktop").click(function() {
      bramble.useDesktopPreview();
    });

    // Mobile Preview Mode
    $("#preview-pane-nav-phone").click(function() {
      bramble.useMobilePreview();
    });

    // Hook up event listeners
    bramble.on("layout", function(data) {
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
