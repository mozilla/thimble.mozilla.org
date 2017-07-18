"use strict";

let fs = require("q-io/fs");
let path = require("path");
let nunjucks = require("nunjucks");

let env = require("../server/lib/environment");
let getListLocales = require("./common").getListLocales;

let development = env.get("NODE_ENV") === "development";
let src = path.join(process.cwd(), development ? "public" : "dist");
let dest = path.join(process.cwd(), development ? "client" : "dist");
let localeDir = path.join(process.cwd(), env.get("L10N").locale_dest || "dist/locales");

let locales = [];
let strings = {
  "en_US": require(path.join(localeDir, "en_US", "messages.json"))
};
strings.en_US.locale = "en_US";

function makeLocalizedCopy(locale, srcPath, template) {
  let destPath = path.join(dest, locale, path.relative(src, srcPath));

  return fs.makeTree(path.dirname(destPath))
  .then(() => {
    return new Promise((resolve, reject) => {
      template.render(srcPath, strings[locale], (err, localizedContent) => {
        if(err) {
          reject(err);
          return;
        }

        fs.write(destPath, localizedContent)
        .then(resolve);
      });
    });
  });
}

function localizeFile(filePath) {
  let isJS = path.extname(filePath) === ".js";
  if(!isJS) {
    return Promise.resolve();
  }

  let template = nunjucks.configure(filePath, { noCache: true });

  return Promise.all(locales.map(locale => makeLocalizedCopy(locale, filePath, template)));
}

function localizeClientFiles() {
  return fs.listTree(src)
  .then(nodePaths => Promise.all(nodePaths.map(nodePath => {
    return fs.stat(nodePath)
    .then(stats => {
      if(!stats.isFile()) {
        return;
      }

      return localizeFile(nodePath);
    });
  })));
}

function createClientLocaleDirectories() {
  let createLocalizedDirectories = locales.map(locale => fs.makeTree(path.join(dest, locale)));

  return Promise.all(createLocalizedDirectories);
}

function cleanupOldClient() {
  function ignoreMissingDirectory(err) {
    if(err.code === "ENOENT") {
      return Promise.resolve();
    }

    return Promise.reject(err);
  }

  if(development) {
    return fs.removeTree(dest).catch(ignoreMissingDirectory);
  }

  let deleteLocalizedClientFiles = locales.map(locale => fs.removeTree(path.join(dest, locale)).catch(ignoreMissingDirectory));

  return Promise.all(deleteLocalizedClientFiles);
}

function readLocaleStrings(localeList) {
  locales = JSON.parse(JSON.stringify(localeList));
  localeList.splice(localeList.indexOf("en_US"), 1);

  localeList.forEach(locale => {
    let localizedStrings = require(path.join(localeDir, locale, "messages.json"));
    localizedStrings.locale = locale;

    strings[locale] = Object.assign(JSON.parse(JSON.stringify(strings["en_US"])), localizedStrings);
  });
}

if(require.main === module) {
  getListLocales(localeDir)
  .then(readLocaleStrings)
  .then(cleanupOldClient)
  .then(createClientLocaleDirectories)
  .then(localizeClientFiles)
  .then(() => console.log("Successfully localized the client at: ", dest))
  .catch((err) => console.error("Failed to generate localized client with: ", err));
}

module.exports = {
  readLocaleStrings,
  localizeClientFiles,
  localizeFile,
  makeLocalizedCopy
};
