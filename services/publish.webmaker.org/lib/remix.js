"use strict";

const Hoek = require(`hoek`);
const Url = require(`url`);

const REMIX_SCRIPT = process.env.REMIX_SCRIPT;

Hoek.assert(REMIX_SCRIPT, `Must define location of the remix script`);

const remixUrl = Url.parse(REMIX_SCRIPT);
const slashes = remixUrl.slashes ? `//` : ``;

function injectMetadata(html, metadata) {
  let metaTags = ``;

  Object.keys(metadata)
  .forEach(function(key) {
    metaTags += `<meta name="data-remix-${key}" content="${metadata[key]}">\n`;
  });

  return html.replace(/<head>/, `$&` + metaTags);
}

function injectRemixScript(html) {
  return html.replace(
    /<\/head/,
    `<script src="${REMIX_SCRIPT}" type="text/javascript"></script>\n$&`
  );
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
