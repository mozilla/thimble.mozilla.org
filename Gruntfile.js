module.exports = function( grunt ) {
  // Make grunt auto-load 3rd party tasks
  // and show the elapsed time of each task when
  // it runs
  require('time-grunt')(grunt);
  require('jit-grunt')(grunt, {
    checkBranch: 'grunt-npm',
    gitadd: 'grunt-git'
  });

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
          }],
          findNestedDependencies: true,
          fileExclusionRegExp: /^homepage/,
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
            "BrambleShim": "editor/scripts/bramble-shim",
            "jquery": "../node_modules/jquery/dist/jquery.min",
            "localized": "../node_modules/webmaker-i18n/localized",
            "uuid": "../node_modules/node-uuid/uuid",
            "cookies": "../node_modules/cookies-js/dist/cookies",
            "PathCache": "editor/scripts/path-cache",
            "constants": "editor/scripts/constants",
            "EventEmitter": "../node_modules/wolfy87-eventemitter/EventEmitter.min",
            "analytics": "editor/scripts/analytics",
            "moment": "../node_modules/moment/min/moment-with-locales.min"
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
            "public/lib/**/*.js",
            "public/resources/remix/index.js",
            "!public/homepage/scripts/google-analytics.js",
            "!public/editor/scripts/google-analytics.js"
          ]
        }
      }
    }
  });

  grunt.registerTask("test", [ "jshint:server", "jshint:frontend", "lesslint" ]);
  grunt.registerTask("build", [ "test", "requirejs:dist" ]);
  grunt.registerTask("default", [ "test" ]);
};
