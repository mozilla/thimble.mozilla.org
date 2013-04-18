/**
 * Check whether the requesting user is authenticated through Persona.
 */
exports.checkForPersonaAuth = function(req, res, next) {
  if (!req.session.email) {
    return next(new Error("please log in first"));
  }
  next();
};

/**
 * Check to see whether a page request is actually for some page.
 */
exports.requestForId = function(req, res, next) {
  if(!req.params.id) {
    return next(new Error("request did not point to a project"));
  }
  next();
};

/**
 * Check to see if a publish attempt actually has data for publishing.
 */
exports.checkForPublishData = function(req, res, next) {
  if(!req.body.html || req.body.html.trim() === "") {
    return next(new Error("no data to publish"));
  }
  next();
};

/**
 * Ensure there is a variable that indicates what this
 * page is a remix of. If there is no 'original', then
 * this will be an empty string.
 */
exports.checkForOriginalPage = function(req, res, next) {
  if(!req.body['original-url']) {
    req.body['original-url'] = "";
  } else {
    var idPos = req.body['original-url'].lastIndexOf('/') + 1;
    req.body['original-url'] = req.body['original-url'].substring(idPos);
  }
  next();
};

/**
 * Sanitize to-publish data by running it through a RESTful Bleach endpoint
 */
exports.bleachData = function(endpoint) {
  var sanitize = require('htmlsanitizer'),
      // whitelist for HTML5 elements
      ALLOWED_TAGS = [
      "!doctype", "html", "body", "a", "abbr", "address", "area", "article",
      "aside", "audio", "b", "base", "bdi", "bdo", "blockquote", "body", "br",
      "button", "canvas", "caption", "cite", "code", "col", "colgroup",
      "command", "datalist", "dd", "del", "details", "dfn", "div", "dl", "dt",
      "em", "embed", "fieldset", "figcaption", "figure", "footer", "form",
      "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr",
      "html", "i", "iframe", "img", "input", "ins", "keygen", "kbd", "label",
      "legend", "li", "link", "map", "mark", "menu", "meta", "meter", "nav", 
      "noscript", "object", "ol", "optgroup", "option", "output", "p", "param",
      "pre", "progress", "q", "rp", "rt", "s", "samp", "section", "select",
      "small", "source", "span", "strong", "style", "sub", "summary", "sup", 
      "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time",
      "title", "tr", "track", "u", "ul", "var", "video", "wbr"
    ],
    // whitelist for HTML5 element attributes.
    ALLOWED_ATTRS = {
      "meta": ["charset", "name", "content"],
      "*": ["class", "id", "style"],
      "img": ["src", "width", "height"],
      "a": ["href"],
      "base": ["href"],
      "iframe": ["src", "width", "height", "frameborder", "allowfullscreen"],
      "video": ["controls", "autoplay", "preload", "loop", "mediaGroup", "src",
                "poster", "muted", "width", "height"],
      "audio": ["controls", "autoplay", "preload", "loop", "src"],
      "source": ["src", "type"],
      "link": ["href", "rel", "type"]
    };

  // sanitize passed HTML by running it through Bleach
  return function(req, res, next) {
    sanitize({
      endpoint: endpoint,
      text: req.body.html,
      tags: ALLOWED_TAGS,
      attributes: ALLOWED_ATTRS,
      styles: [],
      strip: false,
      strip_comments: false,
      parse_as_fragment: false
    }, function(err, sanitizedData) {
      req.body.sanitizedHTML = sanitizedData;
      next(err);
    });
  };
};

/**
 * Publish a page to the database. If it's a publish by
 * the owning user, update. Otherwise, insert.
 */
exports.saveData = function(db, hostName) {
  return function(req, res, next) {
    var options = {
      userid: req.session.email,
      originalURL: req.body['original-url'],
      rawData: req.body.html,
      sanitizedData: req.body.sanitizedHTML,
      finalizedData: req.body.sanitizedHTML
    };
    db.write(options, function(err, result) {
      req.publishId = result.id;
      req.publishUrl = hostName + '/remix/' + req.publishId;
      next();
    });
  };
};

/**
 * Publish a page to S3. If it's a publish by
 * the owning user, update. Otherwise, new page.
 */
// TODO: stubbed, pending an actual S3 writer
exports.publishData = function(s3writer) {
  return function(req, res, next) {
/*
    var id = req.publishId;

    // map this id to an S3 link here
    ...

    // write to S3
    s3writer.write({
      ...
    }, function(err, result) {
      // error/success handling
      next(err);
    });
*/
    next();
  };
};

/**
 * Publish a page to the makeAPI. If it's "our" page,
 * update, otherwise, create.
 */
exports.publishMake = function(make) {
  return function(req, res, next) {
    var metadata = req.body.metadata || {},
        options = {
          thumbnail: metadata.thumbnail || "http://www.google.ca",
          contentType: "text/html",
          title: metadata.title || "",
          description: metadata.description || "",
          author: metadata.author || "",
          locale: metadata.locale || "",
          email: req.session.email,
          url: req.publishUrl,
          tags : metadata.tags || []
        };

    // connect to makeAPI and publish
    make.publish(options, function(err) {
      next(err);
    });
  };
};
