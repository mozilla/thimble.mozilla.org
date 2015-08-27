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

    watch: {
      default: {
        files: [
          'frontend/src/scripts/**/*.js',
          'frontend/src/styles/**/*.less'
        ],
        tasks: [
          'jshint:frontend',
          'browserify',
          'lesslint',
          'less'
        ],
        options: {
          spawn: true,
          interrupt: true
        }
      }
    },

     requirejs: {
      dist: {
        options: {
          appDir: "./public/editor/scripts/",
          baseUrl: "./editor/js",
          dir: "./dist",
          modules: [{
            name: "../../main"
          }],
          optimizeCss: "none",
          removeCombined: true,
          paths: {
            "text": "../vendor/require.text",
            "i18n": "../vendor/require.i18n",
            "sso-override": "../../sso-override",
            "jquery": "../../../../../bower_components/jquery/index",
            "localized": "../../../../../bower_components/webmaker-i18n/localized",
            "uuid": "../../../../../bower_components/node-uuid/uuid",
            "cookies": "../../../../../bower_components/cookies-js/dist/cookies",
            "project": "../../project/project",
            "constants": "../../constants"
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
            "lib/**/*.js",
            "routes/**/*.js"
          ]
        }
      },
      frontend: {
        options: {
          jshintrc: './.jshintrc'
        },
        files: {
          src: [
            // Temporary, until we shift entirely to browserify
            "public/scripts/**/*.js",
            "!public/scripts/editor/vendor/*.js",
            "frontend/src/scripts/**/*.js",
            "frontend/src/scripts/*.js"
          ]
        }
      }
    },

    // Minification
    uglify: {
      default: {
        files: {
          'frontend/dist/scripts/thimble.min.js': ['frontend/dist/scripts/thimble.js']
        }
      }
    },
    cssmin: {
      default: {
        files: [{
          expand: true,
          cwd: 'frontend/src/styles',
          src: ['*.css'],
          dest: 'frontend/dist/styles',
          ext: '.min.css'
        }]
      }
    },

    // Build
    browserify: {
      default: {
        src: "./frontend/src/scripts/index.js",
        dest: "./frontend/dist/scripts/thimble.js",
        options: {
          alias: {
            // Specify bower dependencies here for use with commonjs
            // requires e.g. require('zepto');
            "zepto": "./bower_components/zepto/zepto.min.js"
          },
          browserifyOptions: {
            commondir: false
          }
        }
      },
    },
    less: {
      default: {
        options: {
          compress: true
        },
        files: {
          "frontend/dist/styles/error.css": "frontend/src/styles/error.less"
        }
      }
    }
  });

  // Thimble-task: build
  //   Lints and builds the thimble front-end JavaScript and
  //   LESS styles. Optional uglification. Optional watchifying
  //   Takes:
  //    [environment] - 'dev' or 'prod'
  //    [watch] - true or false, but [environment] must be 'dev'
  grunt.registerTask( "build", function(environment, watch) {
    environment = environment === "prod" ? "prod" : "dev";
    watch = watch == "true" ? true : false;

    var tasks = [
      "lesslint",
      "less",
      "jshint:frontend",
      "browserify"
    ];

    if (environment === 'prod') {
      tasks.push('uglify');
      tasks.push('cssmin');
    } else if (watch) {
      grunt.task.run(['watch']);
      return;
    }

    grunt.task.run(tasks);
  });

  grunt.registerTask( "test", [ "jshint:server", "jshint:frontend", "lesslint" ]);
  grunt.registerTask( "default", [ "test" ]);
};

