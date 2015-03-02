var require = {
  baseUrl: "js",
  shim: {
    underscore: {
      exports: function() {
        return _.noConflict();
      }
    },
    // Apparently jQuery 1.7 and above uses a named define(), which
    // makes it a bona fide module which doesn't need a shim. However,
    // it also doesn't bother calling jQuery.noConflict(), which we
    // want, so we do a bit of configuration ridiculousness to
    // accomplish this.
    "jquery.min": {
      exports: 'jQuery'
    },
    "jquery-ui": {
      deps: ["jquery"]
    },
    "jquery-tipsy": {
      deps: ["jquery"],
      exports: 'jQuery'
    },
    "jquery-slowparse": {
      deps: ["jquery"],
      exports: "jQuery"
    },
    backbone: {
      deps: ["underscore", "jquery"],
      exports: function() {
        return Backbone.noConflict();
      }
    }
  },
  packages: ['slowparse-errors'],
  paths: {
    // Vendor paths
    "jquery.min": "../vendor/jquery.min",
    "jquery-ui": "../vendor/jquery-ui.min",
    "jquery-tipsy": "../vendor/jquery.tipsy",
    "jquery-slowparse": "../vendor/slowparse/src/shim/errors.jquery",
    "underscore": "../vendor/underscore.min",
    "backbone": "../vendor/backbone.min",
    "slowparse": "../vendor/slowparse",
    // some independent functions
    "text": "../vendor/require.text",
    "i18n": "../vendor/require.i18n",
    "lscache": "../vendor/lscache",
    // Non-vendor paths
    "jquery": "shims/jquery.no-conflict",
    "backbone-events": "shims/backbone-events",
    "template": "require.template",
    "test": "../test",
    "templates": "../templates",
    "localized": "/bower/webmaker-i18n/localized",
    "languages": "/bower/webmaker-language-picker/js/languages",
    "selectize": "/bower/selectize/dist/js/standalone/selectize.min",
    "list": "/bower/listjs/dist/list.min",
    "fuzzySearch": "/bower/list.fuzzysearch.js/dist/list.fuzzysearch.min",
    "analytics": "/bower/webmaker-analytics/analytics",
    "url-template": "/bower/url-template/lib/url-template"
  },
  config: {
    template: {
      htmlPath: "templates",
      i18nPath: "fc/nls/ui"
    }
  }
};

if (typeof(module) == 'object' && module.exports) {
  // We're running in node.
  module.exports = require;
  // For some reason requirejs in node doesn't like shim function exports.
  require.shim['underscore'].exports = '_';
  require.shim['backbone'].exports = 'Backbone';
} else (function() {
  var RE = /^(https?:)\/\/([^\/]+)\/(.*)\/require-config\.js$/;
  var me = document.querySelector('script[src$="require-config.js"]');
  var console = window.console || {log: function() {}};
  if (me) {
    var parts = me.src.match(RE);
    if (parts) {
      var protocol = parts[1];
      var host = parts[2];
      var path = '/' + parts[3];
      if (protocol != location.protocol || host != location.host)
        console.log("origins are different. requirejs text plugin may " +
                    "not work.");
      require.baseUrl = path;
    }
  }
  console.log('require.baseUrl is ' + require.baseUrl);
})();
