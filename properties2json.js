/*
 * Adapted from https://github.com/mozilla/donate.mozilla.org/blob/master/scripts/properties2json.js
 */

var properties = require("properties-parser");
var write = require("fs-writefile-promise");
var path = require("path");
var FS = require("q-io/fs");

var localeDir = path.join(process.cwd(), process.env["LOCALE_DIR"] || "locale");

function getListLocales() {
  return new Promise(function(resolve, reject) {
    FS.listDirectoryTree(localeDir).then(function(dirTree) {
      var list = [];
      dirTree.forEach(function(i) {
        var that = i.split(localeDir + "/");
        if (that[1]) {
          list.push(that[1]);
        }
      });
      return resolve(list);
    }).catch(reject);
  });
}

function writeFile(entries) {
  entries.reduce(function(prevEntry, entry) {
    write(path.join(localeDir, entry.locale, "messages.json"), JSON.stringify(entry.content, null, 2), "utf-8")
    .then(function(filename) {
      console.log("Done writing: " + filename);
    });
  }, {});
}

function getContentMessages(locale) {
  return new Promise(function(resolve, reject) {
    properties.read(path.join(localeDir, locale, "messages.properties"), function(message_error, message_properties) {
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

getListLocales().then(processMessageFiles)
.then(writeFile).catch(function(err) {
  console.error(err);
});
