/**
 * Temporary Bramble API protection to deal with the case of Thimble and Bramble
 * being out of sync (e.g., Service Worker Cache), and Thimble trying to use methods
 * in Bramble that don't exist in the cached version of Bramble. We have code to deal
 * with this, and will prompt the user to refresh, and get new a new API version;
 * however, we'd like to avoid crashing first.  This shims all potential API methods
 * that might cause us to crash, so we at least get to load fully, after which we'll
 * show the refresh info.
 *
 * If you add some new API call to Bramble, add a shim here first so we always start up.
 *
 * NOTE: this shim deals with new code since:
 * https://github.com/mozilla/brackets/commit/b8dfbc6a20c785437b0441839c3825df72e38dc0
 *
 * See https://github.com/mozilla/thimble.mozilla.org/pull/2097#issuecomment-301494035
 * for API additons covered below.
 */

var sentUpdatesAvailable = false;

function triggerUpdatesAvailable() {
  // Since we've used a shimmed API call, we should trigger our Reload flow.
  // The `updatesAvailable` event was introduced in the new API, so won't happen
  // with this old API; however, if we've loaded Bramble, it will also have updated
  // cache, and it should do the right thing when the user reloads.
  if (sentUpdatesAvailable) {
    return;
  }

  sentUpdatesAvailable = true;
  console.log(
    "[Thimble] Bramble API out of date, please reload your browser for updates"
  );
  Bramble.trigger("updatesAvailable");
}

function defaultFalse() {
  triggerUpdatesAvailable();
  return false;
}

function defaultTrue() {
  triggerUpdatesAvailable();
  return true;
}

function returnZero() {
  triggerUpdatesAvailable();
  return 0;
}

function getAutoCloseTagsDefault() {
  return {
    whenClosing: true,
    whenOpening: true,
    indentTags: []
  };
}

function noop() {}

function arg0WithCallback(callback) {
  callback = callback || noop;
  setTimeout(callback, 0);
  triggerUpdatesAvailable();
}

function arg1WithCallback(arg0, callback) {
  arg0WithCallback(callback);
}

// Add any missing functions we might need until the user updates their API.
function shimAPI(bramble) {
  // New API Getters
  bramble.getAutocomplete = bramble.getAutocomplete || defaultTrue;
  bramble.getAutoCloseTags =
    bramble.getAutoCloseTags || getAutoCloseTagsDefault;
  bramble.getAllowJavaScript = bramble.getAllowJavaScript || defaultTrue;
  bramble.getAllowWhiteSpace = bramble.getAllowWhiteSpace || defaultFalse;
  bramble.getAutoUpdate = bramble.getAutoUpdate || defaultTrue;
  bramble.getOpenSVGasXML = bramble.getOpenSVGasXML || defaultFalse;
  bramble.getTotalProjectSize = bramble.getTotalProjectSize || returnZero;
  bramble.hasIndexFile = bramble.hasIndexFile || defaultTrue;
  bramble.getFileCount = bramble.getFileCount || returnZero;

  // New API Methods
  bramble.enableWhiteSpace = bramble.enableWhiteSpace || arg0WithCallback;
  bramble.disableWhiteSpace = bramble.disableWhiteSpace || arg0WithCallback;
  bramble.enableAutocomplete = bramble.enableAutocomplete || arg0WithCallback;
  bramble.disableAutocomplete = bramble.disableAutocomplete || arg0WithCallback;
  bramble.openSVGasXML = bramble.openSVGasXML || arg0WithCallback;
  bramble.openSVGasImage = bramble.openSVGasImage || arg0WithCallback;
  bramble.configureAutoCloseTags =
    bramble.configureAutoCloseTags || arg1WithCallback;
  bramble.addCodeSnippet = bramble.addCodeSnippet || arg1WithCallback;
}

module.exports = {
  shimAPI: shimAPI
};
