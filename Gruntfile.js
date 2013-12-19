module.exports = function( grunt ) {
  grunt.initConfig({
    pkg: grunt.file.readJSON( "package.json" ),

    csslint: {
      lax: {
        options: {
          "adjoining-classes": false,
          "box-model": false,
          "box-sizing": false,
          "bulletproof-font-face": false,
          "compatible-vendor-prefixes": false,
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
        },
        src: [
          "public/learning_projects/**/*.css"
        ]
      },
    recess: {
      dist: {
        options: {
          noOverQualifying: false,
          noIDs: false,
          strictPropertyOrder: false
        },
        src: [
          "public/stylesheets/*.less"
        ]
      }
    }
    },
    jshint: {
      options: {
        "-W069": true // ignore "['...'] is better written in dot notation." warnings
      },
      files: [
        "Gruntfile.js",
        "app.js",
        "lib/**/*.js",
        "routes/**/*.js",
        "public/friendlycode/js/**/*.js",
        "public/friendlycode/vendor/slowparse/slowparse.js",
        "public/friendlycode/vendor/slowparse/test/nodetest.js",
        "public/friendlycode/vendor/slowparse/test/test-slowparse.js",
        "public/friendlycode/vendor/slowparse/test/node/qunit-shim.js"
      ]
    }
  });

  grunt.loadNpmTasks( "grunt-contrib-csslint" );
  grunt.loadNpmTasks( "grunt-contrib-jshint" );

  grunt.registerTask( "default", [ "csslint", "jshint" ]);
};
