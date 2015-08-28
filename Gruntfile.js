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
      }
    },
    lesslint: {
      src: ["public/stylesheets/userbar-overrides.less"],
        options: {
          csslint: {
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
    },
    execute: {
      target: {
        src: [
          "public/friendlycode/vendor/slowparse/test.js"
        ]
      }
    }
  });

  grunt.loadNpmTasks( "grunt-contrib-csslint" );
  grunt.loadNpmTasks( "grunt-lesslint" );
  grunt.loadNpmTasks( "grunt-contrib-jshint" );
  grunt.loadNpmTasks( "grunt-execute" );

  grunt.registerTask( "default", [ "csslint", "jshint", "execute" ]);
};

