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
    },

    // Bramble tasks
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
            },
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


  // Thimble-task: update
  //   Updates the brackets submodule, committing and
  //   pushing the result.
  grunt.registerTask( "update", function() {
    var date = new Date(Date.now()).toString();
    grunt.config("gitcommit.module.options.message", "Submodule update on " + date);

    grunt.task.run([
        // Confirm we're ready to start
        'checkBranch',

        // Update submodules, commit and push to "master"
        'update_submodules:publish',
        'gitadd:modules',
        'gitcommit:module',
        'smartPush:' + GIT_BRANCH + ":false"
    ]);
  });

  grunt.registerTask( "default", [ "csslint", "jshint", "execute", "lesslint" ]);
};

