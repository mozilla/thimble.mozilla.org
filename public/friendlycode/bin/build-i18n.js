var fs = require('fs');
var sys = require('sys');
var path = require('path');
var buildRequire = require('./build-require');
var rootDir = buildRequire.rootDir;
var requirejs = require('requirejs');
var config = buildRequire.generateConfig();
var bundles = exports.bundles = {};
var packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, "..",
                                                       "package.json"),
                                             "utf-8"));

var makePlist = exports.makePlist = function(bundle) {
  var escapeXML = function(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');
  };
  var lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" ' +
    '"http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
    '<plist version="1.0">',
    '  <dict>'
  ];
  
  Object.keys(bundle.root).forEach(function(key) {
    if (bundle.metadata && bundle.metadata[key]) {
      var metadata = bundle.metadata[key];
      var helpText = metadata.helpText || metadata.help;
      if (helpText)
        lines.push('    <!-- ' + escapeXML(helpText) + ' -->');
    }
    lines.push('    <key>' + escapeXML(key) + '</key>');
    lines.push('    <string>' + escapeXML(bundle.root[key]) + '</string>');
  });
  
  lines.push('  </dict>');
  lines.push('</plist>');
  return lines.join('\n');
};

function loadModulesInNlsPath(path) {
  fs.readdirSync(rootDir + '/' + path).forEach(function(filename) {
    var match = filename.match(/^(.*)\.js$/);
    if (match) {
      var moduleName = path + '/' + match[1];
      var bundle = requirejs(moduleName);
      
      bundles[moduleName] = bundle;
    }
  });
}

function loadInlineL10nStrings() {
  var InlineL10n = requirejs('inline-l10n');
  var templateCfg = config.config.template;
  var templateDir = requirejs.toUrl(templateCfg.htmlPath).replace(".js", "");
  var root = bundles[templateCfg.i18nPath].root;
  var metadata = bundles[templateCfg.i18nPath].metadata;
  var relTemplateDir = path.relative(path.normalize(__dirname + '/..'),
                                     templateDir);

  fs.readdirSync(templateDir).forEach(function(filename) {
    var content = fs.readFileSync(templateDir + '/' + filename, 'utf8');
    var defaultValues = InlineL10n.parse(content);
    for (var key in defaultValues) {
      var value = defaultValues[key];
      var githubUrl = packageJson.repository.url.replace(".git", "/blob/") +
                      packageJson.repository.defaultBranch +
                      '/' + relTemplateDir + '/' + filename;
      if (key in root && root[key] != value)
        throw new Error("conflicting definitions for key: " + key);
      root[key] = value;
      metadata[key] = {
        helpText: 'This string appears in ' + githubUrl + '.',
        help: 'This string appears in ' +
              '<a href="' + githubUrl + '">' + filename + '</a>.'
      };
    }
  });
}

function showBundleModuleList(indent) {
  Object.keys(bundles).forEach(function(name) {
    sys.puts((indent || "") + name);
  });
}

function validateNlsModuleName(moduleName) {
  if (!(moduleName in bundles)) {
    if (!moduleName)
      sys.puts("Unspecified module name. Valid choices are:\n");
    else
      sys.puts("'" + moduleName + "' is not a valid module name. " +
               "Valid choices are:\n");
    showBundleModuleList("  ");
    sys.puts("");
    process.exit(1);
  }
}

function main() {
  var program = require('commander');
  program
    .command('template [module-name]')
    .description('output JS for an i18n bundle module, which can be ' +
                 'used as a template for localization')
    .action(function(moduleName) {
      validateNlsModuleName(moduleName);
      var root = JSON.stringify(bundles[moduleName].root, null, 2);
      sys.puts("define(" + root + ");"); 
    });
  program
    .command('list')
    .description('display a list of i18n bundle modules')
    .action(function() { showBundleModuleList(); });
  program
    .command('json')
    .description('output JSON blob containing strings and metadata for ' +
                 'all i18n bundles')
    .action(function() {
      sys.puts(JSON.stringify(bundles, null, 2));
    });
  program
    .command('plist [module-name]')
    .description('output plist file for an i18n bundle module')
    .action(function(moduleName) {
      validateNlsModuleName(moduleName);
      sys.puts(makePlist(bundles[moduleName]));
    });
  program.parse(process.argv);
  if (process.argv.length == 2)
    program.help();
}

config.isBuild = true;
requirejs.config(config);

buildRequire.findNlsPaths(rootDir).forEach(loadModulesInNlsPath);
loadInlineL10nStrings();

if (!module.parent) main();
