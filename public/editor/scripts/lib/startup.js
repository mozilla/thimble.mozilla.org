/* globals $: true */
/**
 * Various startup logic related to showing/clearing loading UI, analytics, and errors.
 */
var $ = require("jquery");
var bowser = require("bowser");

var analytics = require("../../../shared/scripts/analytics");

// How long to wait until we show the "Slow loading..." UI
var errorMessageTimeoutMS = 10000;
var errorMessageTimeout;

function refreshClicked() {
  analytics.event({
    category: analytics.eventCategories.TROUBLESHOOTING,
    action: "Refresh button clicked"
  });
  window.location.reload(true);
}

function showLoadingErrorMessage() {
  analytics.event({
    category: analytics.eventCategories.TROUBLESHOOTING,
    action: "Project loading slowly (Green screen)"
  });

  $("#spinner-container .taking-too-long").addClass("visible");
  $("button.refresh-browser").on("click", refreshClicked);
}

function onBrambleError(err) {
  console.error("[Bramble Error] error loading Bramble", err);
  $("#spinner-container").addClass("loading-error");
  $("button.refresh-browser").on("click", refreshClicked);
  analytics.event({
    category: analytics.eventCategories.TROUBLESHOOTING,
    action: "Editor loading error (Black Screen)"
  });
  analytics.exception(err, true);
}

function showUpdatesAvailableRefreshAlert() {
  console.log(
    "Thimble has updates - please refresh your browser to get the latest changes."
  );
  analytics.event({
    category: analytics.eventCategories.TROUBLESHOOTING,
    action: "Updates available UI shown"
  });
  $("button.refresh-browser").on("click", refreshClicked);
  $("body").addClass("has-alert-bar");
  $("#serviceworker-warning").removeClass("hide");
}

function init(startFn) {
  // Warn users of unsupported browsers that they can try something newer,
  // specifically anything before IE 11 or Safari 8.
  if (
    (bowser.msie && bowser.version < 11) ||
    (bowser.safari && bowser.version < 8)
  ) {
    $("#browser-support-warning").removeClass("hide");
    analytics.event({
      category: analytics.eventCategories.TROUBLESHOOTING,
      action: "Browser version warning shown"
    });

    $(".let-me-in").on("click", function() {
      analytics.event({
        category: analytics.eventCategories.TROUBLESHOOTING,
        action: "Browser version warning dismissed"
      });
      $("#browser-support-warning").fadeOut();
      return;
    });
  }

  // If Bramble fails to load (some browser loading issues cause it to fail),
  // error out now, since we won't get to Bramble.on('error', ...)
  if (!window.Bramble) {
    onBrambleError(new Error("Unable to load Bramble editor in this browser"));
    return;
  }

  // Listen for startup errors on Bramble
  Bramble.once("error", onBrambleError);

  // Listen for update events from Bramble's service worker
  Bramble.once("updatesAvailable", showUpdatesAvailableRefreshAlert);

  // Start a timer so we can warn if the editor hangs during starup
  errorMessageTimeout = window.setTimeout(
    showLoadingErrorMessage,
    errorMessageTimeoutMS
  );

  startFn();
}

function finish() {
  if (errorMessageTimeout) {
    window.clearTimeout(errorMessageTimeout);
  }

  // Once startup is done, we won't get errors from Bramble again.
  Bramble.off("error", onBrambleError);

  $("#spinner-container").fadeOut();
  analytics.timing({
    category: analytics.timingCategories.THIMBLE,
    var: "Startup Complete. Editor UI Usable"
  });
}

module.exports = {
  init: init,
  finish: finish
};
