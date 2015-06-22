module.exports = function( grunt ) {
  // Make grunt auto-load 3rd party tasks
  // and show the elapsed time of each task when
  // it runs
  require('time-grunt')(grunt);
  require('jit-grunt')(grunt, {
    checkBranch: 'grunt-npm',
    gitadd: 'grunt-git'
  });

  var habitat = require('habitat');
  habitat.load();
  env = new habitat();

  var GIT_BRANCH = env.get('THIMBLE_MAIN_BRANCH');
  var GIT_REMOTE = env.get('THIMBLE_MAIN_REMOTE');

  grunt.initConfig({
    pkg: grunt.file.readJSON( "package.json" ),

    watch: {
      default: {
        files: [
          'frontend/scripts/**/*.js',
          'frontend/scripts/*.js',
          'frontend/styles/**/*.less',
          'frontend/styles/*.less'
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

    // Linting
    lesslint: {
      src: [
        "./frontend/styles/*.less"
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
      default: {
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
      frontend: {
        files: {
          src: [
            "./frontend/scripts/**/*.js",
            "./frontend/scripts/*.js"
          ]
        }
      }
    },

    // Minification
    uglify: {
      default: {
        files: {
          'public/scripts/thimble.min.js': ['public/scripts/thimble.js']
        }
      }
    },
    cssmin: {
      default: {
        files: [{
          expand: true,
          cwd: 'frontend/styles',
          src: ['*.css'],
          dest: 'public/styles',
          ext: '.min.css'
        }]
      }
    },

    // Build
    browserify: {
      default: {
        src: "./frontend/scripts/index.js",
        dest: "./public/scripts/thimble.js",
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
          "frontend/styles/error.css": "frontend/styles/error.less"
        }
      }
    },

    // Workflow
    'npm-checkBranch': {
      options: {
        branch: GIT_BRANCH
      }
    },
    "update_submodules": {
      publish: {
        options: {
          params: "--remote -- public/friendlycode/vendor/brackets"
        }
      }
    },
    gitcommit: {
      module: {
        options: {
          // This is replaced during the 'publish' task
          message: "Placeholder"
        }
      }
    },
    gitadd: {
      modules: {
        files: {
          src: ['./public/friendlycode/vendor/brackets']
        }
      }
    },
    gitpush: {
      smart: {
        options: {
          remote: GIT_REMOTE,
          // These options are left in for
          // clarity. Their actual values
          // will be set by the `publish` task.
          branch: GIT_BRANCH
        }
      }
    }
  });

  // Thimble-task: smartPush
  //   Checks out to the branch provided as a target.
  //   Takes:
  //    [branch] - The branch to push to
  //    [force] - If true, forces a push
  grunt.registerTask('smartPush', function(branch, force) {
      force = force == "true" ? true : false;

      grunt.config('gitpush.smart.options.branch', branch);
      grunt.config('gitpush.smart.options.force', force);
      grunt.task.run('gitpush:smart');
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
      tasks.push('watch');
    }

    grunt.task.run(tasks);
  });

  grunt.registerTask( "default", [ "csslint", "jshint", "execute" ]);
};

