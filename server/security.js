"use strict";

let helmet = require("helmet");
let csurf = require("csurf");

const ONE_YEAR = 31536000000;
const PONTOON_URL = "https://pontoon.mozilla.org";

let defaultCSPDirectives = {
  defaultSrc: ["'self'"],
  connectSrc: [
    "'self'",
    PONTOON_URL,
    "https://mozilla.github.io/thimble-homepage-gallery/activities.json",
    "https://api.github.com/repos/mozilla/thimble.mozilla.org/issues"
  ],
  frameSrc: ["'self'", "https://docs.google.com", "blob:"],
  childSrc: ["'self'", PONTOON_URL, "blob:"],
  frameAncestors: [PONTOON_URL],
  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com",
    "https://netdna.bootstrapcdn.com",
    "https://code.cdn.mozilla.net/",
    PONTOON_URL
  ],
  imgSrc: ["*"],
  mediaSrc: ["*"],
  scriptSrc: [
    "'self'",
    "http://mozorg.cdn.mozilla.net",
    "https://ajax.googleapis.com",
    "https://mozorg.cdn.mozilla.net",
    "https://www.google-analytics.com",
    PONTOON_URL
  ],
  styleSrc: [
    "'self'",
    "http://mozorg.cdn.mozilla.net",
    "https://ajax.googleapis.com",
    "https://fonts.googleapis.com",
    "https://mozorg.cdn.mozilla.net",
    "https://netdna.bootstrapcdn.com",
    PONTOON_URL,
    // Inline style for the spinner
    "'sha256-AnlD8XRHNPxhNZ/6MucKFJr9yYGQtn8bmvveYkBg7a4='"
  ]
};

const validateCSRF = csurf();

function Security(server) {
  this.server = server;
}

Security.csp = directiveList => {
  directiveList = directiveList || {};

  Object.keys(defaultCSPDirectives).forEach(function(directive) {
    const domainsToAdd = directiveList[directive];
    const defaultDomains = defaultCSPDirectives[directive];

    if (!Array.isArray(domainsToAdd)) {
      directiveList[directive] = defaultDomains;
      return;
    }

    if (domainsToAdd.indexOf("*") !== -1) {
      directiveList[directive] = ["*"];
    } else if (defaultDomains.indexOf("*") !== -1) {
      directiveList[directive] = domainsToAdd;
    } else {
      directiveList[directive] = defaultDomains.concat(domainsToAdd);
    }
  });

  return helmet.contentSecurityPolicy({
    directives: directiveList
  });
};
Security.ssl = () => helmet.hsts({ maxAge: ONE_YEAR });
Security.xss = () => helmet.xssFilter();
Security.mimeSniff = () => helmet.noSniff();
Security.csrf = () => (req, res, next) => {
  if (/^(\/en-US)?\/(published)?projects\/\d+\/export/.test(req.path)) {
    next();
  } else {
    validateCSRF(req, res, next);
  }
};
Security.xframe = () =>
  helmet.frameguard({
    action: "allow-from",
    domain: PONTOON_URL
  });

Security.prototype = {
  csp(directiveList) {
    this.server.use(Security.csp(directiveList));

    return this;
  },
  ssl() {
    this.server.use(Security.ssl());
    this.server.enable("trust proxy");

    return this;
  },
  xss() {
    this.server.use(Security.xss());
    return this;
  },
  mimeSniff() {
    this.server.use(Security.mimeSniff());
    return this;
  },
  csrf() {
    this.server.use(Security.csrf());
    return this;
  },
  xframe() {
    // Only allow framing from Pontoon
    this.server.use(Security.xframe());
    return this;
  }
};

module.exports = Security;
