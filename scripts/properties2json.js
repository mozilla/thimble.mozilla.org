/*
 * Adapted from https://github.com/mozilla/donate.mozilla.org/blob/master/scripts/properties2json.js
 */

var properties = require("properties-parser");
var write = require("fs-writefile-promise");
var path = require("path");
var FS = require("q-io/fs");

var env = require("../server/lib/environment");
var getListLocales = require("./common").getListLocales;

var l10nConfig = env.get("L10N");
var localeSrc = path.join(process.cwd(), l10nConfig.locale_src || "locales");
var localeDest = path.join(process.cwd(), l10nConfig.locale_dest || l10nConfig.locale_src || "locales");
var en_USStrings;

function writeFiles(localeInfoList) {
  localeInfoList.forEach(function(localeInfo) {
    var langDir = path.join(localeDest, localeInfo.locale.replace(/-/g, "_"));

    if(!localeInfo.content || Object.keys(localeInfo.content).length < 1) {
      console.log("Skipping ", localeInfo.locale, " due to missing strings");
      return Promise.resolve();
    }

    FS.makeTree(langDir)
    .then(function() {
      var content = Object.assign({}, en_USStrings, localeInfo.content);

      return write(path.join(langDir, "messages.json"), JSON.stringify(content, null, 2), "utf-8")
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

      properties.read(path.join(localeSrc, locale, "client.properties"), function(client_error, client_properties) {
        if (client_error && client_error.code !== "ENOENT") {
          return reject(client_error);
        }

        properties.read(path.join(localeSrc, locale, "server-client-shared.properties"), function(shared_error, shared_properties) {
          if (shared_error && shared_error.code !== "ENOENT") {
            return reject(shared_error);
          }

          var strings = Object.assign({}, message_properties, client_properties, shared_properties);

          if(locale === "en-US") {
            en_USStrings = strings;
          }

          resolve({content: strings, locale: locale});
        });
      });
    });
  });
}

function processMessageFiles(locales) {
  return Promise.all(locales.map(getContentMessages));
}

getListLocales(localeSrc)
.then(processMessageFiles)
.then(removeOldLocales)
.then(writeFiles)
.catch(function(err) {
  console.error(err);
});
