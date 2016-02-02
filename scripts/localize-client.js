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

let templateEngine = new nunjucks.Environment(new nunjucks.FileSystemLoader(src));
let locales = [];
let strings = {
  "en_US": require(path.join(localeDir, "en_US", "messages.json"))
};

function makeLocalizedCopy(locale, srcPath, isJS, template) {
  let destPath = path.join(dest, locale, path.relative(src, srcPath));

  return fs.makeTree(path.dirname(destPath))
  .then(() => {
    if(!isJS) {
      return fs.copy(srcPath, destPath);
    }

    return new Promise((resolve, reject) => {
      template.render(strings[locale], function(err, localizedContent) {
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

function localizeClientFiles() {
  return fs.listTree(src)
  .then(nodePaths => Promise.all(nodePaths.map(nodePath => {
    return fs.stat(nodePath)
    .then(stats => {
      if(!stats.isFile()) {
        return;
      }

      let isJS = path.extname(nodePath) === ".js";
      let template;
      if(isJS) {
        template = templateEngine.getTemplate(path.relative(src, nodePath));
      }

      return Promise.all(locales.map(locale => makeLocalizedCopy(locale, nodePath, isJS, template)));
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
  let en_USlocalizedStrings = strings["en_US"];
  locales = JSON.parse(JSON.stringify(localeList));
  localeList.splice(localeList.indexOf("en_US"), 1);

  localeList.forEach(locale => {
    let localizedStrings = require(path.join(localeDir, locale, "messages.json"));

    strings[locale] = Object.assign(localizedStrings, en_USlocalizedStrings);
  });
}

getListLocales(localeDir)
.then(readLocaleStrings)
.then(cleanupOldClient)
.then(createClientLocaleDirectories)
.then(localizeClientFiles)
.then(() => console.log("Successfully localized the client at: ", dest))
.catch((err) => console.error("Failed to generate localized client with: ", err));
