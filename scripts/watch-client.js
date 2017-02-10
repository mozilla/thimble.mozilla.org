"use strict";

let fs = require("q-io/fs");
let path = require("path");
let chokidar = require("chokidar");
let colors = require("colors");

let getListLocales = require("./common").getListLocales;
let localizeClient = require("./localize-client");
let env = require("../server/lib/environment");

let root = process.cwd();
let localeDir = path.join(root, env.get("L10N").locale_dest || "dist/locales");
let dest = path.join(root, "client");
let localeDirList;

let log = {
  args(color) {
    return Array.prototype.map.call(this, arg => typeof arg === "string" ? colors[color](arg) : arg);
  },
  error() {
    console.log.apply(console, arguments ? log.args.call(arguments, "red") : null);
  },
  info() {
    console.log.apply(console, arguments ? log.args.call(arguments, "green") : null);
  }
};

function deleteFile(relativeFilePath) {
  let deleteLocalizedFile = localeDirList.map(localeDir => fs.remove(path.join(localeDir, relativeFilePath)));

  return Promise.all(deleteLocalizedFile);
}

function updateClient(event, filePath) {
  if(event === "unlink") {
    return deleteFile(path.relative("public", filePath))
    .then(() => log.info("Deleted localized instances of ", filePath))
    .catch((err) => log.error("Failed to delete localized versions of ", filePath, " with: ", err));
  }

  if(event === "add" || event === "change") {
    return localizeClient.localizeFile(path.join(root, filePath))
    .then(() => log.info("Updated localized instances of ", filePath))
    .catch((err) => log.error("Failed to update localized versions of ", filePath, " with: ", err));
  }
}

getListLocales(localeDir)
.then(locales => {
  localeDirList = locales.map(locale => path.join(dest, locale));

  return localizeClient.readLocaleStrings(locales);
})
.then(() => {
  let watcher = chokidar.watch("public/**/*.js", { cwd: root, usePolling: true });
  watcher.on("ready", () => {
    watcher.on("all", updateClient)
    log.info("Thimble client watching started for changes to public/**/*.js");
  });
});
