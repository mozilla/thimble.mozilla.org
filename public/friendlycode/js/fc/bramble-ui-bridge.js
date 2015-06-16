define(["jquery"], function($) {

  function updateLayout(data) {
    // Calculate total width of brackets
    var total = data.sidebarWidth + data.firstPaneWidth + data.secondPaneWidth;

    // Set width in percent, easier for window resize
    $(".filetree-pane-nav").width(((data.sidebarWidth / total) * 100) + "%");
    $(".editor-pane-nav").width(((data.firstPaneWidth / total) * 100) + "%");
    $(".preview-pane-nav").width(((data.secondPaneWidth / total) * 100) + "%");
  }

  function init(bramble) {
    // Align to the current state of the editor's layout on startup
    updateLayout(bramble.getLayout());

    // Smooths resize
    $(window).resize(function() {
      $("#editor-pane-nav-options-menu").hide();
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


    // Refresh Preview
    $("#preview-pane-nav-refresh").click(function() {
      bramble.refreshPreview();
    });

    // Desktop Preview Mode
    $("#preview-pane-nav-desktop").click(function() {
      bramble.useDesktopPreview();
      $("#preview-pane-nav-desktop").css("opacity", 1);
      $("#preview-pane-nav-phone").css("opacity", 0.3);
    });

    // Mobile Preview Mode
    $("#preview-pane-nav-phone").click(function() {
      bramble.useMobilePreview();
      $("#preview-pane-nav-phone").css("opacity", 1);
      $("#preview-pane-nav-desktop").css("opacity", 0.3);
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
