var codemirror = "codemirror3";
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
    },
    codemirror: {
      exports: "CodeMirror"
    },
    "codemirror/xml": {
      deps: ["codemirror"],
      exports: "CodeMirror"
    },
    "codemirror/javascript": {
      deps: ["codemirror"],
      exports: "CodeMirror"
    },
    "codemirror/css": {
      deps: ["codemirror"],
      exports: "CodeMirror"
    },
    "codemirror/html": {
      deps: [
        "codemirror/xml",
        "codemirror/javascript",
        "codemirror/css"
      ],
      exports: "CodeMirror"
    }
  },
  packages: ['slowparse-errors'],
  paths: {
    // Vendor paths
    "jquery.min": "../vendor/jquery.min",
    "jquery-tipsy": "../vendor/jquery.tipsy",
    "jquery-slowparse": "../vendor/slowparse/spec/errors.jquery",
    "underscore": "../vendor/underscore.min",
    "backbone": "../vendor/backbone.min",
    "slowparse": "../vendor/slowparse",
    "codemirror": "../vendor/" + codemirror + "/lib/codemirror",
    "codemirror/xml": "../vendor/" + codemirror + "/mode/xml/xml",
    "codemirror/javascript": "../vendor/" + codemirror + "/mode/javascript/javascript",
    "codemirror/css": "../vendor/" + codemirror + "/mode/css/css",
    "codemirror/html": "../vendor/" + codemirror + "/mode/htmlmixed/htmlmixed",
    "text": "../vendor/require.text",
    "i18n": "../vendor/require.i18n",
    "lscache": "../vendor/lscache",
    // Non-vendor paths
    "jquery": "shims/jquery.no-conflict",
    "backbone-events": "shims/backbone-events",
    "template": "require.template",
    "test": "../test",
    "templates": "../templates",
    "localized": "/bower/webmaker-i18n/localized"
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
