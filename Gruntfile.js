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
        // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
        options: {
          baseUrl: "./public/scripts/editor/js",
          paths: {
            "text": "../vendor/require.text",
            "i18n": "../vendor/require.i18n",
            "sso-override": "../../sso-override",
            "jquery": "../../../../bower_components/jquery/index",
            "localized": "../../../../bower_components/webmaker-i18n/localized",
            "uuid": "../../../../bower_components/node-uuid/uuid",
            "cookies": "../../../../bower_components/cookies-js/dist/cookies",
            "project": "../../project/project",
            "constants": "../../constants"
          },
          shim: {
            "jquery": {
              exports: "$"
            }
          },
          optimizeCss: "none",
          out: 'dist/main.js',
          optimize: 'uglify2',
          include: ["../../main"],
          preserveLicenseComments: false,
          useStrict: true,
          wrap: {
            start: "(require(['../../main'], function() {",
            end:   "}));"
          },
          wrap: false,
          uglify2: {} // https://github.com/mishoo/UglifyJS2
        }
      }
    },

    // Linting
    lesslint: {
      src: [
        "./frontend/src/styles/*.less"
      ],
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

