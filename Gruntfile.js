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

    // Linting
    lesslint: {
      src: [
        "./public/editor/stylesheets/*.less",
        "./public/homepage/stylesheets/*.less",
        "./public/projects-list/stylesheets/*.less",
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
            "public/error/**/*.js",
            "public/homepage/**/*.js",
            "public/projects-list/**/*.js",
            "public/shared/**/*.js",
            "!public/shared/scripts/google-analytics.js",
            "public/resources/remix/index.js"
          ]
        }
      }
    }
  });

  grunt.registerTask("test", [ "jshint:server", "jshint:frontend", "lesslint" ]);
  grunt.registerTask("default", [ "test" ]);
};
