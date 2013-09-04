const BASE_URL = 'https://www.transifex.com/api/2/project/';
const DEFAULT_DIR = 'transifex';
const DEFAULT_PROJECT = 'friendlycode';

var request = require('request');
var fs = require('fs');
var sys = require('sys');
var path = require('path');
var mkpath = require('mkpath');

var toTransifexLocale = exports.toTransifexLocale = function(locale) {
  var parts = locale.split(/[-_]/);
  if (parts.length >= 2)
    return parts[0].toLowerCase() + "_" + parts[1].toUpperCase();
  return parts[0].toLowerCase();
};

var toBundleLocale = exports.toBundleLocale = function(locale) {
  return locale.toLowerCase().replace(/_/g, '-');
};

var parseProjectDetails = exports.parseProjectDetails = function(project) {
  var details = {};
  project.resources.forEach(function(resource) {
    var parts = resource.name.split('/');
    details[resource.name] = {
      slug: resource.slug,
      path: parts.slice(0, -1).join('/'),
      moduleName: parts[parts.length-1]
    };
  });
  return details;
};

var toBundleMetadata = exports.toBundleMetadata = function(resource) {
  var metadata = {};
  resource.available_languages.forEach(function(language) {
    if (language.code == resource.source_language_code)
      return metadata.root = true;
    metadata[toBundleLocale(language.code)] = true;
  });
  return metadata;
};

var toBundleDict = exports.toBundleDict = function(options) {
  var dict = {};
  options.strings.forEach(function(info) {
    if (!info.translation) return;
    if (options.reviewedOnly && !info.reviewed) return;
    dict[info.key] = info.translation;
  });
  return dict;
};

function importFromTransifex(options) {
  var authHeader = 'Basic ' + new Buffer(options.user).toString('base64');
  var writeModule = function(relPath, exports) {
    var absPath = path.join(options.dir, relPath);
    var js = "define(" + JSON.stringify(exports, null, 2) + ");";

    mkpath.sync(path.dirname(absPath));
    fs.writeFileSync(absPath, js, "utf-8");
    sys.puts("wrote " + absPath + ".");
  };
  var projectRequest = function(path, cb) {
    var url = BASE_URL + options.project + path;
    request.get({
      url: url,
      headers: {'Authorization': authHeader}
    }, function(error, response, body) {
      if (error)
        throw error;
      if (response.statusCode !== 200)
        throw new Error(url + " returned " + response.statusCode);
      cb(JSON.parse(body));
    });
  };
  
  projectRequest("/?details", function(projectDetails) {
    var resources = parseProjectDetails(projectDetails);
    Object.keys(resources).forEach(function(modulePath) {
      var resourcePath = "/resource/" + resources[modulePath].slug;
      projectRequest(resourcePath + "/?details", function(resourceDetails) {
        var bundleMetadata = toBundleMetadata(resourceDetails);
        
        writeModule(modulePath + ".js", bundleMetadata);
        Object.keys(bundleMetadata).forEach(function(bundleLocale) {
          var transifexLocale;
          if (bundleLocale == "root")
            transifexLocale = resourceDetails.source_language_code;
          else
            transifexLocale = toTransifexLocale(bundleLocale);
          projectRequest(
            resourcePath + "/translation/" + transifexLocale + "/strings/",
            function(strings) {
              var bundleDict = toBundleDict({
                strings: strings,
                reviewedOnly: options.reviewedOnly
              });
              writeModule(resources[modulePath].path + "/" +
                          bundleLocale + "/" +
                          resources[modulePath].moduleName + ".js",
                          bundleDict);
            }
          );
        });
      });
    });
  });
}

function main() {
  var program = require('commander');
  program
    .option('-u, --user <user:pass>', 'specify username and password')
    .option('-p, --project <slug>', 'specify project slug')
    .option('-r, --reviewed-only', 'only include reviewed strings')
    .option('-d, --dir <path>', 'root output dir for exported i18n bundles')
    .parse(process.argv);
  if (!program.user) {
    sys.puts('please specify credentials with "-u user:pass".');
    process.exit(1);
  }
  if (!program.project)
    program.project = DEFAULT_PROJECT;
  if (!program.dir)
    program.dir = DEFAULT_DIR;
  importFromTransifex(program);
}

if (!module.parent) main();
