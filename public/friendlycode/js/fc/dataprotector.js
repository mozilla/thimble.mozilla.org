/**
 * Prevent users from unintentionally leaving a page
 * by clicking on a link or reloading the page.
 */
define([ "localized" ], function( Localized ) {
  "use strict";

  var DataProtector = {
    protected: false,
    protectUnsavedData: function() {
      return Localized.get("You have unsaved project data");
    },
    enableDataProtection: function() {
      if (!this.protected) {
        window.onbeforeunload = this.protectUnsavedData;
        this.protected = true;
      }
    },
    disableDataProtection: function() {
      window.onbeforeunload = null;
      this.protected = false;
    }
  };

  return DataProtector;
});
