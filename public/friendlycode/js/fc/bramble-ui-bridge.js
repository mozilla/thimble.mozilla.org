define(["jquery"], function($) {

  function updateLayout(data) {
    $(".editor-pane-nav").width(data.firstPaneWidth + data.sidebarWidth);
    $(".preview-pane-nav").width(data.secondPaneWidth);
  }

  function init(bramble) {
    // Align to the current state of the editor's layout on startup
    updateLayout(bramble.getLayout());

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
    bramble.on("layout", updateLayout);

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
