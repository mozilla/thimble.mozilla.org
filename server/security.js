"use strict";

let helmet = require("helmet");
let csurf = require("csurf");

const ONE_YEAR = 31536000000;

let defaultCSPDirectives = {
  defaultSrc: [ "'self'" ],
  connectSrc: [
    "'self'",
    "https://pontoon.mozilla.org",
    "https://mozilla.github.io/thimble-homepage-gallery/activities.json",
    "https://api.github.com/repos/mozilla/thimble.mozilla.org/issues"
  ],
  frameSrc: [
    "'self'",
    "https://docs.google.com",
    "blob:"
  ],
  childSrc: [
    "'self'",
    "https://pontoon.mozilla.org",
    "blob:"
  ],
  frameAncestors: [
    "https://pontoon.mozilla.org"
  ],
  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com",
    "https://netdna.bootstrapcdn.com",
    "https://code.cdn.mozilla.net/",
    "https://pontoon.mozilla.org"
  ],
  imgSrc: [ "*" ],
  mediaSrc: [ "*" ],
  scriptSrc: [
    "'self'",
    "http://mozorg.cdn.mozilla.net",
    "https://ajax.googleapis.com",
    "https://mozorg.cdn.mozilla.net",
    "https://www.google-analytics.com",
    "https://pontoon.mozilla.org"
  ],
  styleSrc: [
    "'self'",
    "http://mozorg.cdn.mozilla.net",
    "https://ajax.googleapis.com",
    "https://fonts.googleapis.com",
    "https://mozorg.cdn.mozilla.net",
    "https://netdna.bootstrapcdn.com",
    "https://pontoon.mozilla.org",
    // Inline style for the spinner
    "'unsafe-inline'"
  //  "'sha256-jxjTomDIR9qe7wntK24mAd+gIoz39DrBll8o6DEBALs='"
  ]
};

function Security(server) {
  this.server = server;
}

Security.prototype = {
  csp(directiveList) {
    directiveList = directiveList || {};
    Object.keys(defaultCSPDirectives).forEach(function(directive) {
      let domainsToAdd = directiveList[directive];
      let defaultDomains = defaultCSPDirectives[directive];

      if(domainsToAdd && defaultDomains.indexOf("*") !== -1) {
        directiveList[directive] = domainsToAdd;
      } else {
        directiveList[directive] = defaultDomains.concat((domainsToAdd || []));
      }
    });

    this.server.use(helmet.contentSecurityPolicy({
      directives: directiveList
    }));

    return this;
  },
  ssl() {
    this.server.use(helmet.hsts({ maxAge: ONE_YEAR }));
    this.server.enable("trust proxy");

    return this;
  },
  xss() {
    this.server.use(helmet.xssFilter());
    return this;
  },
  mimeSniff() {
    this.server.use(helmet.noSniff());
    return this;
  },
  csrf() {
    this.server.use(csurf());
    return this;
  },
  xframe() {
    this.server.use(helmet.frameguard({ action: "DENY" }));
    return this;
  }
};

module.exports = Security;
