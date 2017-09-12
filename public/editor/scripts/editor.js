/* globals $: true */
var $ = require("jquery");

var UI = require("./ui");
var FileSystemSync = require("./filesystem-sync");
var Project = require("./project");
var BrambleShim = require("./bramble-shim");
var analytics = require("../../shared/scripts/analytics");

var _csrfToken;

function create(options) {
  FileSystemSync.init(_csrfToken);

  // Start loading the Bramble editor resources
  Bramble.load("#webmaker-bramble", {
    url: options.editorUrl,
    hideUntilReady: true
  });

  // Start loading the project files
  Project.load(_csrfToken, function(err, fileToOpen) {
    if (err) {
      console.error("[Thimble Error]", err);
      $("#spinner-container").addClass("loading-error");
      analytics.event({
        category: analytics.eventCategories.TROUBLESHOOTING,
        action: "Project loading error (Green screen)"
      });
      analytics.exception(err, true);
      return;
    }

    // Now that fs is setup, tell Bramble which root dir to mount
    // and which file within that root to open on startup.
    Bramble.mount(Project.getRoot(), fileToOpen);
  });

  Bramble.once("ready", function(bramble) {
    analytics.timing({
      category: analytics.timingCategories.BRAMBLE,
      var: "ready Event"
    });

    // Make sure we don't crash trying to access new APIs not in Bramble's API
    // before we update the Service Worker cached version we're using.
    BrambleShim.shimAPI(bramble);

    // For debugging, attach to window.
    window.bramble = bramble;
    UI.init(bramble, _csrfToken, options.appUrl);
  });
}

$(function() {
  _csrfToken = $("meta[name='csrf-token']").attr("content");
});

module.exports = {
  get csrfToken() {
    return _csrfToken;
  },
  create: create
};
