/*
 * Adapted from https://github.com/mozilla/donate.mozilla.org/blob/master/scripts/properties2json.js
 */

const co = require("co");
const properties = require("properties-parser");
const fs = require("fs");
const path = require("path");
const shell = require("shelljs");

const env = require("../../server/lib/environment");

const IS_DEVELOPMENT = env.get("NODE_ENV") === "development";
const l10nConfig = env.get("L10N");
const src = path.resolve(process.cwd(), l10nConfig.locale_src || "locales");
const dest = path.resolve(
  process.cwd(),
  l10nConfig.locale_dest || "dist/locales"
);
const locales = fs.readdirSync(src);

const JS_WRAPPER = `window.__THIMBLE_STRINGS__= {
  get: function(key) {
    return this._values[key];
  },
  `;
const JS_WRAPPER_MIN =
  "window.__THIMBLE_STRINGS__={get:function(_){return this._values[_]},";

function writeFile(locale, file, properties, addWrapper) {
  locale = locale.replace(/-/g, "_");
  properties = JSON.stringify(properties, null, IS_DEVELOPMENT ? 2 : 0);
  if (addWrapper) {
    properties = `${IS_DEVELOPMENT
      ? JS_WRAPPER
      : JS_WRAPPER_MIN}_values: ${properties}};`;
  }

  return new Promise(function(resolve, reject) {
    shell.mkdir("-p", path.join(dest, locale));
    fs.writeFile(path.join(dest, locale, file), properties, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function readProperties(locale, fileName) {
  return new Promise(function(resolve, reject) {
    properties.read(path.join(src, locale, `${fileName}.properties`), function(
      err,
      properties
    ) {
      if (err) {
        reject(err);
      } else {
        resolve(properties);
      }
    });
  });
}

// Cleanup the old build
shell.rm("-rf", dest);
shell.mkdir("-p", dest);

co(function*() {
  // First write en-US strings
  const enUSServerProperties = yield readProperties("en-US", "server");
  const enUSClientProperties = yield readProperties("en-US", "client");
  const enUSSharedProperties = yield readProperties(
    "en-US",
    "server-client-shared"
  );

  yield writeFile(
    "en-US",
    "messages.json",
    Object.assign(enUSServerProperties, enUSSharedProperties)
  );
  yield writeFile(
    "en-US",
    "strings.js",
    Object.assign(enUSClientProperties, enUSSharedProperties),
    true
  );

  // Then write out the rest of the locale strings and fallback to en-US strings
  // for missing strings in a particular locale.
  for (locale of locales.filter(l => l !== "en-US" && l !== ".DS_Store")) {
    const serverProperties = yield readProperties(locale, "server");
    const clientProperties = yield readProperties(locale, "client");
    const sharedProperties = yield readProperties(
      locale,
      "server-client-shared"
    );

    yield writeFile(
      locale,
      "messages.json",
      Object.assign(
        enUSServerProperties,
        enUSSharedProperties,
        serverProperties,
        sharedProperties
      )
    );
    yield writeFile(
      locale,
      "strings.js",
      Object.assign(
        enUSClientProperties,
        enUSSharedProperties,
        clientProperties,
        sharedProperties
      ),
      true
    );
  }
}).catch(err => console.error(err));
