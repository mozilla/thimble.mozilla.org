(function() {
  var pageToLoad = document.getElementById("friendly-code").getAttribute("data-page-to-load"),
      appUrl = document.getElementById("friendly-code").getAttribute("data-app-url"),
      makeDetails = document.getElementById("friendly-code").getAttribute("data-make-details"),
      editorUrl = document.getElementById("friendly-code").getAttribute("data-editor-url"),
      editorHost = document.getElementById("friendly-code").getAttribute("data-editor-host");

  // unpack makedetails
  makeDetails = JSON.parse(decodeURIComponent(makeDetails));

  /**
   * This code sets up the various Friendlycode values for
   * publication and remixing.
   */
  define("thimblePage",
         ["jquery", "friendlycode", "languages"],
         // XXXBramble - nuke Languages when possible
         function($, FriendlycodeEditor, Languages) {

    // Call this when language picker element is ready.
    Languages.ready({ position: "bottom", arrow: "top" }, true);

    var editor = FriendlycodeEditor({
      container: $("#bare-fc-holder"),
      makeDetails: makeDetails,
      editorUrl: editorUrl,
      editorHost: editorHost,
      appUrl: appUrl
    });

    if (typeof TogetherJS !== "undefined") {
      TogetherJS.reinitialize();
    }

    return editor;
  });
}());
