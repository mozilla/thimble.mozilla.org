var require = {
  baseUrl: "friendlycode/js",
  shim: {
    underscore: {
      exports: function() {
        "use strict";

        return _.noConflict();
      }
    }
  },
  paths: {
    // Vendor paths
    "jquery": "https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min",
    "underscore": "../vendor/underscore.min",
    // some independent functions
    "text": "../vendor/require.text",
    "i18n": "../vendor/require.i18n",
    // Non-vendor paths
    "template": "require.template",
    "templates": "../templates",
    "localized": "/bower/webmaker-i18n/localized",
    "uuid": "/bower/node-uuid/uuid",
    "cookies": "/bower/cookies-js/dist/cookies"
  },
  config: {
    template: {
      htmlPath: "templates",
      i18nPath: "fc/nls/ui"
    }
  }
};

