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
  if(!req.body["original-url"]) {
    req.body["original-url"] = "";
  } else {
    var idPos = req.body["original-url"].lastIndexOf("/") + 1;
    req.body["original-url"] = req.body["original-url"].substring(idPos);
  }
  next();
};

/**
 * Sanitize to-publish data by running it through a RESTful Bleach endpoint
 */
exports.bleachData = function(endpoint) {
  var sanitize = require("htmlsanitizer"),
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
      originalURL: req.body["original-url"],
      rawData: req.body.html,
      sanitizedData: req.body.sanitizedHTML
    };
    db.write(options, function(err, result) {
      req.publishId = result.id;
      next(err);
    });
  };
};

/**
 * Finalise a page's HTML by adding all the <head> code, remix
 * buttons, GA anchor, etc. etc to the page data.
 */
exports.finalizeProject = function(nunjucksEnv, env) {
  return function(req, res, next) {
    var sanitized = req.body.sanitizedHTML,
        hostname = env.get("HOSTNAME"),
        remixTemplate = nunjucksEnv.getTemplate("remixTemplate.html"),
        remixThis = remixTemplate.render({
          cssUrl: hostname + "/stylesheets",
          mixUrl: hostname + "/remix/" + req.publishId + "/edit"
        }),
        metadata = req.body.metadata || {},
        metaTagTemplate = nunjucksEnv.getTemplate("ogMetaTags.html"),
        metaTags = metaTagTemplate.render({
          metaTags: [
            {
              "name": "og:url",
              "content": hostname + "/remix/" + req.publishId
            },
            {
              "name": "og:site_name",
              "content": "Mozilla Webmaker"
            },
            {
              "name": "og:title",
              "content": metadata.title || "",
            },
            {
              "name": "og:description",
              "content": metadata.description || "",
            },
            {
              "name": "og:author",
              "content": metadata.author || "",
            },
            {
              "name": "og:image",
              "content": metadata.title || "",
            },
            {
              "name": "og:locale",
              "content": metadata.locale || "",
            },
            {
              "name": "og:updated_time",
              "content": ""
            }
          ]
        }),
        finalized = sanitized.replace(/<body([^>]*)>/, "<body$1>" + remixThis)
                             .replace(/<head([^>]*)>/, "<head$1>" + metaTags);

    // google analytics are env-conditional
    if (env.get("GA_ACCOUNT")) {
      var gaTemplate = nunjucksEnv.getTemplate("ga.html"),
          ga = gaTemplate.render({
            GA_ACCOUNT: env.get("GA_ACCOUNT"),
            GA_DOMAIN: env.get("GA_DOMAIN")
          });
      finalized = finalized.replace("</head", ga + "</head");
    }

    req.body.finalizedHTML = finalized;
    next();
  };
};

/**
 * Publish a page to S3. If it's a publish by
 * the owning user, this effecs an update. Otherwise,
 * this will create a new S3 object (=page).
 */
exports.publishData = function(options) {
  var knox = require("knox"),
      s3 = knox.createClient(options);

  return function(req, res, next) {
    var pageId = req.publishId,
        userId = req.session.email,
        data = req.body.finalizedHTML,
        headers = {
          "x-amz-acl": "public-read",
          "Content-Length": Buffer.byteLength(data,"utf8"),
          "Content-Type": "text/html;charset=UTF-8"
        };

    // TODO: proper mapping for old->new ids.
    // See: https://bugzilla.mozilla.org/show_bug.cgi?id=862911
    var location = userId + "/" + pageId;

    // write data to S3
    s3.put(location, headers)
    .on("error", function(err) {
      // FIXME: Plan for S3 being down. This is not the ideal error handling,
      //        but is a working stub in lieu of a proper solution.
      // See: https://bugzilla.mozilla.org/show_bug.cgi?id=865738
      next(new Error("There was a problem publishing the page. Your page has been saved"+
                     " with id "+req.publishId+", so you can edit it, but it could not be"+
                     " published to the web."));
    })
    .on("response", function(res) {
      if (res.statusCode === 200) {
        // FIXME: the actual url might end up being different due to subdomain faking.
        // See: https://bugzilla.mozilla.org/show_bug.cgi?id=863368
        var url = res.req.url;
        if(s3.port) {
          // FIXME: knox has a feature where it will not add the port to the url,
          //        even if you explicitly used one. A bug was filed on this.
          // See: https://github.com/LearnBoost/knox/issues/168
          url = url.replace(s3.domain, s3.domain + ":" + s3.port);
        }
        req.publishedUrl = url;
        next();
      } else {
        next(new Error("failure during publish step (error "+res.statusCode+")"));
      }
    })
    .end(data);
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
          thumbnail: metadata.thumbnail,
          contentType: "application/x-thimble",
          title: metadata.title || "",
          description: metadata.description || "",
          author: metadata.author || "",
          locale: metadata.locale || "",
          email: req.session.email,
          url: req.publishedUrl,
          tags : metadata.tags || []
        };

    // connect to makeAPI and publish
    make.publish(options, function(err) {
      // We don't stop thimble because of errors in the makeapi yet.
      // We know this has errors, and are fixing it, for now, keep going.
      // Problems with server side auth. See: https://bugzilla.mozilla.org/show_bug.cgi?id=865439
      console.error("MakeAPI Error");
      console.error(err);
      next();
    });
  };
};
