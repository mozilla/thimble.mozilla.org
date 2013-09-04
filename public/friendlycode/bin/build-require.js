var requirejs = require('requirejs'),
  fs = require('fs'),
  url = require('url'),
  jsdom = require('jsdom').jsdom,
  resolve = require('path').resolve,
  requireConfig = require('../js/require-config'),
  rootDir = resolve(__dirname, '..', 'js'),
  name = 'friendlycode',
  cssIn = resolve(rootDir, "..", "css", "friendlycode.css"),
  cssOut = resolve(rootDir, "..", "css", "friendlycode-built.css"),
  jsOut = resolve(rootDir, 'friendlycode-built.js');

var bailOnError = function(err) {
  process.stderr.write(err.toString());
  process.exit(1);
};

var findNlsPaths = exports.findNlsPaths = function(root, subdir) {
  var nlsPaths = [];
  subdir = subdir || '';
  fs.readdirSync(root + subdir).forEach(function(filename) {
    var relpath = subdir + '/' + filename;
    var stat = fs.statSync(root + relpath);
    if (stat.isDirectory()) {
      if (filename == 'nls') {
        nlsPaths.push(relpath.slice(1));
      } else
        nlsPaths = nlsPaths.concat(findNlsPaths(root, relpath));
    }
  });
  
  return nlsPaths;
};

var generateConfig = exports.generateConfig = function(options) {
  options = options || {};
  
  var config = {
    name: name,
    out: jsOut,
    // use none optimize for debugging
    optimize: "none",
    // optimize: 'uglify',
    uglify: {
      // beautify for debugging
      // beautify: true,
      mangle: true
    },
    makeDocument: function() {
      return jsdom('<html></html>', null, {
        features: {
          FetchExternalResources: false,
          ProcessExternalResources: false,
          MutationEvents: false,
          QuerySelector: true
        }
      });
    }
    // TODO: Consider using mainConfigFile here. For more info, see:
    // https://github.com/mozilla/friendlycode/pull/112#issuecomment-6625412
  };
  Object.keys(requireConfig).forEach(function(name) {
    config[name] = requireConfig[name];
  });
  config.baseUrl = rootDir;
  
  if (options.i18nUrl) {
    var runtimePathConfig = {paths: {}};
    findNlsPaths(rootDir).forEach(function(path) {
      config.paths[path] = "empty:";
      runtimePathConfig.paths[path] = url.resolve(options.i18nUrl, path);
    });
    config.wrap = {
      start: "require.config(" + JSON.stringify(runtimePathConfig) + ");",
      end: ""
    };
  }
  
  return config;
};

exports.rootDir = rootDir;

function main() {
  var program = require('commander');

  program
    .option('--i18n-url [url]', "base URL to i18n bundles")
    .parse(process.argv);

  console.log("Generating", jsOut);

  requirejs.optimize(generateConfig(program), function (buildResponse) {
    // buildResponse is just a text output of the modules
    // included.
    console.log("Done. About " + buildResponse.split('\n').length +
                " modules are inside the generated JS file.");
    requirejs.optimize({
      cssIn: cssIn,
      out: cssOut
    }, function() {
      console.log("Optimized CSS.");
      process.exit();
    }, bailOnError);
  }, bailOnError);
}

if (!module.parent) main();
