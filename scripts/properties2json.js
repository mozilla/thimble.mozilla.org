/*
 * Adapted from https://github.com/mozilla/donate.mozilla.org/blob/master/scripts/properties2json.js
 */

var properties = require("properties-parser");
var write = require("fs-writefile-promise");
var path = require("path");
var FS = require("q-io/fs");
var env = require("../server/lib/environment");

var l10nConfig = env.get("L10N");
var localeSrc = path.join(process.cwd(), l10nConfig.locale_src || "locales");
var localeDest = path.join(process.cwd(), l10nConfig.locale_dest || l10nConfig.locale_src || "locales");

function getListLocales() {
  return new Promise(function(resolve, reject) {
    FS.listDirectoryTree(localeSrc).then(function(dirTree) {
      var list = [];
      dirTree.forEach(function(locale) {
        locale = path.relative(localeSrc, locale);
        if (locale) {
          list.push(locale);
        }
      });
      return resolve(list);
    }).catch(reject);
  });
}

function writeFiles(localeInfoList) {
  localeInfoList.forEach(function(localeInfo) {
    var langDir = path.join(localeDest, localeInfo.locale.replace(/-/g, "_"));

    FS.makeTree(langDir)
    .then(function() {
      return write(path.join(langDir, "messages.json"), JSON.stringify(localeInfo.content, null, 2), "utf-8")
      .then(function(filename) {
        console.log("Done writing: " + filename);
      });
    })
    .catch(function(err) {
      console.error(err);
    });
  });
}

function removeOldLocales(localeInfoList) {
  return new Promise(function(resolve, reject) {
    FS.removeTree(localeDest)
    .then(function() {
      resolve(localeInfoList);
    })
    .catch(function(err) {
      if(err.code !== "ENOENT") {
        reject(err);
      } else {
        resolve(localeInfoList);
      }
    });
  });
}

function getContentMessages(locale) {
  return new Promise(function(resolve, reject) {
    properties.read(path.join(localeSrc, locale, "messages.properties"), function(message_error, message_properties) {
      if (message_error && message_error.code !== "ENOENT") {
        return reject(message_error);
      }

      resolve({content: message_properties || {}, locale: locale});
    });
  });
}

function processMessageFiles(locales) {
  return Promise.all(locales.map(getContentMessages));
}

getListLocales()
.then(processMessageFiles)
.then(removeOldLocales)
.then(writeFiles)
.catch(function(err) {
  console.error(err);
});
