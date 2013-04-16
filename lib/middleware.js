/**
 * Check whether the requesting user is authenticated through Persona.
 */
exports.checkForPersonaAuth = function(req, res, next) {
  if (!req.session.email) {
    return next(new Error("you'll have to log in to see your published projects"));
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
  };
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
      parse_as_fragment: false,
    }, function(err, sanitizedData) {
      req.body.sanitizedHTML = sanitizedData;
      next(err);
    });
  };
};

/**
 * Publish a page by writing it to the database. If it's "our" page,
 * update, otherwise, insert.
 */
exports.publishData = function(sqlite) {
  // FIXME: this function is still fairly nesty due to the "do we own this" code
  return function(req, res, next) {
    var db = new sqlite.Database('thimble.sqlite', function(err) {
      if(err) { return next(err); }
      
      var personaId = req.session.email,
          rawData = req.body.html,
          sanitizedData = req.body.sanitizedHTML,
          originalRecord = req.body['original-url'];

      db.run("CREATE TABLE IF NOT EXISTS test (personaid TEXT, raw TEXT, sanitized TEXT)", function(err) {
        if(err) return next(err); 

        // do we own this remix? if so, update. Otherwise, insert.
        db.get("SELECT count(*) as count FROM test WHERE rowid = ? AND personaid = ?",
          [originalRecord, personaId],
          function(err, row) {
            if(err) return next(err);

            // if we don't own [originalRecord], write a new entry:
            if(row.count == 0 ) {
              db.run("INSERT INTO test VALUES (?, ?, ?)",
                [personaId, rawData, sanitizedData],
                function(err, result) {
                  req.publishId = this.lastID;
                  return next(err);
                }
              );
            }

            // otherwise, update it with this new content:
            else {
              db.run("UPDATE test SET raw = ?, sanitized = ? WHERE rowid = ?",
                [rawData, sanitizedData, originalRecord],
                function(err, result) {
                  req.publishId = originalRecord;
                  return next(err);
                }
              );
            }
          });
        }
      );
    });
  };
};
