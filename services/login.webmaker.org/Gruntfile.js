module.exports = function (grunt) {
  var jsbeautifyrc = grunt.file.readJSON("node_modules/mofo-style/linters/.jsbeautifyrc");
  var jscsrc = grunt.file.readJSON("node_modules/mofo-style/linters/.jscsrc");
  var jshintrc = grunt.file.readJSON("node_modules/mofo-style/linters/.jshintrc");

  var javaScriptFiles = [
    "Gruntfile.js",
    "app.js",
    "test/**/*.js",
    "lib/**/*.js",
    "app/dev/**/*.js",
    "app/http/*.js",
    "app/lib/*.js",
    "app/http/controllers/*.js",
    "app/http/public/js/*.js",
    "app/http/views/js/*.ejs",
    "app/db/**/*.js"
  ];

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),

    jshint: {
      options: jshintrc,
      files: javaScriptFiles
    },
    jsbeautifier: {
      options: {
        js: jsbeautifyrc
      },
      modify: {
        src: javaScriptFiles
      },
      verify: {
        src: javaScriptFiles,
        options: {
          mode: "VERIFY_ONLY"
        }
      }
    },
    jscs: {
      src: javaScriptFiles,
      options: jscsrc
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-jsbeautifier");
  grunt.loadNpmTasks("grunt-jscs");

  grunt.registerTask("clean", ["jsbeautifier:modify"]);
  grunt.registerTask("validate", ["jsbeautifier:verify", "jshint", "jscs"]);
  grunt.registerTask("default", ["validate"]);
};
