"use strict";

const Hoek = require(`hoek`);
const Url = require(`url`);
const jsdom = require(`jsdom`);

const REMIX_SCRIPT = process.env.REMIX_SCRIPT;

Hoek.assert(REMIX_SCRIPT, `Must define location of the remix script`);

const remixUrl = Url.parse(REMIX_SCRIPT);
const slashes = remixUrl.slashes ? `//` : ``;
const { JSDOM } = jsdom;

function injectMetadata(html, metadata) {
  let metaTags = ``;

  Object.keys(metadata)
  .forEach(function(key) {
    metaTags += `<meta name="data-remix-${key}" content="${metadata[key]}">\n`;
  });

  return html.replace(/<head>/, `$&` + metaTags);
}

function injectRemixScript(html) {
  // Check if <head> tag exists
  var retInject = ``;
  const dom = new JSDOM(html);

  // If they exist, inject remix script before closing </head> tag
  if (dom.window.document.querySelector(`head`)) {
    console.info(`has head tags`);
    retInject = html.replace(
      /<\/head/,
      `  <script src="${REMIX_SCRIPT}" type="text/javascript"></script>\n  $&`);
    console.info(retInject);
  // If they don't exist, add empty <head><\/head> tags and inject remix script
  } else {
    console.info(`missing head tags`);
    retInject = html.replace(
      /<html>/,
      `<html>\n  <head>\n    <title>Untitled<\/title>\n    <script src="${REMIX_SCRIPT}" type="text/javascript"></script>\n  <\/head>`);
    console.info(retInject);
  }

  return retInject;
}

// Inject the Remix script into the given HTML string
// and any metadata (passed as an object) that needs to be added
function inject(srcHtml, metadata) {
  return injectMetadata(
    injectRemixScript(srcHtml),
    metadata
  );
}

module.exports = {
  inject: inject,
  resourceHost: `${remixUrl.protocol}${slashes}${remixUrl.host}`
};
