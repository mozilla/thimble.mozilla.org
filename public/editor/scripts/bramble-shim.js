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
 */

define(function() {

  function defaultFalse() {
    return false;
  }

  function defaultTrue() {
    return true;
  }

  function returnZero() {
    return 0;
  }

  function noop() {}

  function arg0WithCallback(callback) {
    callback = callback || noop;
    setTimeout(callback, 0);
  }

  function arg1WithCallback(arg0, callback) {
    callback = callback || noop;
    setTimeout(callback, 0);
  }

  // Add any missing functions we might need until the user updates their API.
  return function shimAPI(bramble) {
    bramble.getAllowJavaScript     = bramble.getAllowJavaScript || defaultTrue;
    bramble.getAutocomplete        = bramble.getAutocomplete || defaultTrue;
    bramble.getAutoCloseTags       = bramble.getAutoCloseTags || defaultTrue;
    bramble.getAutoUpdate          = bramble.getAutoUpdate || defaultTrue;
    bramble.getTotalProjectSize    = bramble.getTotalProjectSize || returnZero;
    bramble.hasIndexFile           = bramble.hasIndexFile || defaultFalse;
    bramble.getFileCount           = bramble.getFileCount || returnZero;

    bramble.addCodeSnippet         = bramble.addCodeSnippet || arg1WithCallback;
    bramble.configureAutoCloseTags = bramble.configureAutoCloseTags || arg1WithCallback;
    bramble.openSVGasXML           = bramble.openSVGasXML || arg0WithCallback;
    bramble.openSVGasImage         = bramble.openSVGasImage || arg0WithCallback;
  };

});
