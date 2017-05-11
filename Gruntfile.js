module.exports = function( grunt ) {
  // Make grunt auto-load 3rd party tasks
  // and show the elapsed time of each task when
  // it runs
  require('time-grunt')(grunt);
  require('jit-grunt')(grunt, {
    checkBranch: 'grunt-npm',
    gitadd: 'grunt-git'
  });

  var swPrecache = require('sw-precache');
  var Path = require('path');
  var fs = require('fs');

  grunt.initConfig({
    pkg: grunt.file.readJSON( "package.json" ),

    requirejs: {
      dist: {
        options: {
          waitSeconds: 120,
          appDir: "public/",
          baseUrl: "./",
          dir: "dist",
          keepBuildDir: true,
          modules: [{
            name: "editor/scripts/main"
          }, {
            name: "editor/scripts/project-list"
          }, {
            name: "homepage/scripts/main"
          }],
          findNestedDependencies: true,
          optimizeCss: "none",
          removeCombined: true,
          paths: {
            // Folders
            "fc": "editor/scripts/editor/js/fc",
            "project": "editor/scripts/project",

            // Files
            "bowser": "resources/scripts/vendor/bowser",
            "bramble-editor": "editor/scripts/editor/js/bramble-editor",
            "sso-override": "editor/scripts/sso-override",
            "logger": "editor/scripts/logger",
            "jquery": "../node_modules/jquery/dist/jquery.min",
            "localized": "../node_modules/webmaker-i18n/localized",
            "uuid": "../node_modules/node-uuid/uuid",
            "cookies": "../node_modules/cookies-js/dist/cookies",
            "PathCache": "editor/scripts/path-cache",
            "constants": "editor/scripts/constants",
            "EventEmitter": "../node_modules/wolfy87-eventemitter/EventEmitter.min",
            "analytics": "editor/scripts/analytics",
            "moment": "../node_modules/moment/min/moment-with-locales.min",
            "gallery": "homepage/scripts/gallery"
          },
          shim: {
            "jquery": {
              exports: "$"
            }
          },
          optimize: 'uglify2',
          preserveLicenseComments: false,
          useStrict: true,
          uglify2: {}
        }
      }
    },

    // Linting
    lesslint: {
      src: [
        "./public/editor/stylesheets/*.less",
        "./public/editor/stylesheets/*.css",
        "./public/homepage/stylesheets/*.less",
        "./public/homepage/stylesheets/*.css",
        "./public/resources/remix/*.less",
        "./public/resources/tutorial/*.less",
        "./public/resources/tutorial/*.css"
      ],
      options: {
        csslint: {
          "duplicate-properties": false,
          "duplicate-background-images": false,
          "display-property-grouping": false,
          "fallback-colors": false,
          "adjoining-classes": false,
          "box-model": false,
          "box-sizing": false,
          "bulletproof-font-face": false,
          "compatible-vendor-prefixes": false,
          "floats": false,
          "font-sizes": false,
          "ids": false,
          "important": false,
          "outline-none": false,
          "overqualified-elements": false,
          "qualified-headings": false,
          "regex-selectors": false,
          "star-property-hack": false,
          "underscore-property-hack": false,
          "universal-selector": false,
          "unique-headings": false,
          "unqualified-attributes": false,
          "vendor-prefix": false,
          "zero-units": false
        }
      }
    },
    jshint: {
      server: {
        options: {
          jshintrc: './.jshintrc'
        },
        files: {
          src: [
            "Gruntfile.js",
            "app.js",
            "server/**/*.js",
            "constants.js"
          ]
        }
      },
      frontend: {
        options: {
          jshintrc: './.jshintrc'
        },
        files: {
          src: [
            "public/editor/**/*.js",
            "public/homepage/**/*.js",
            "public/resources/remix/index.js",
            "!public/homepage/scripts/google-analytics.js",
            "!public/editor/scripts/google-analytics.js"
          ]
        }
      }
    },
    swPrecache: {
      dist: {
        rootDir: 'dist'
      }
    }
  });

  grunt.registerMultiTask('swPrecache', function() {
    var done = this.async();
    var rootDir = this.data.rootDir;

    // We need the full list of locales so we can create runtime caching rules for each
    fs.readdir('locales', function(err, locales) {
      if(err) {
        grunt.fail.warn(err);
        return done();
      }

      locales = locales.map(function(locale) {
        // en_US to en-US
        return locale.replace('_', '-');
      });

      // /\/(en-US|pt-BR|es|...)\//
      var localesPattern = new RegExp('\/(' + locales.join('|') + ')\/');

      writeServiceWorker(getConfig(localesPattern));
    });

    function getConfig(localesPattern) {
      return {
        cacheId: 'thimble',
        logger: grunt.log.writeln,
        staticFileGlobs: [
          /* TODO: we need to not localize these asset dirs so we can statically cache
          'dist/editor/stylesheets/*.css',
          'dist/resources/stylesheets/*.css',
          'dist/homepage/stylesheets/*.css'
          */
        ],
        runtimeCaching: [
          // TODO: we should be bundling all this vs. loading separate
          {
            urlPattern: /\/node_modules\//,
            handler: 'fastest'
          },
          {
            urlPattern: /\/scripts\/vendor\//,
            handler: 'fastest'
          },

          // TODO: move these to staticFileGlobs--need to figure out runtime path vs. build path issue
          {
            urlPattern: /\/img\//,
            handler: 'fastest'
          },
          {
            urlPattern: /https:\/\/thimble.mozilla.org\/img\//,
            handler: 'fastest'
          },

          // Localization requires runtime caching of rewritten, locale-prefixed URLs
          {
            urlPattern: localesPattern,
            handler: 'fastest'
          },

          // Various external deps we need
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/css/,
            handler: 'fastest'
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'fastest'
          },
          {
            urlPattern: /^https:\/\/mozilla.github.io\/thimble-homepage-gallery\/activities.json/,
            handler: 'fastest'
          },
          {
            urlPattern: /^https:\/\/pontoon.mozilla.org\/pontoon.js/,
            handler: 'fastest'
          }
        ],

        ignoreUrlParametersMatching: [/./]
      };
    }

    function writeServiceWorker(config) {
      swPrecache.write(Path.join(rootDir, 'thimble-sw.js'), config, function(err) {
        if(err) {
          grunt.fail.warn(err);
        }
        done();
      });
    }

  });

  grunt.registerTask("test", [ "jshint:server", "jshint:frontend", "lesslint" ]);
  grunt.registerTask("build", [ "test", "requirejs:dist", "swPrecache" ]);
  grunt.registerTask("default", [ "test" ]);
};
