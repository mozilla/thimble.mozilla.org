module.exports = function middlewareCtor(env) {

  var metrics = require('./metrics')(env),
      thimbleAppTag = env.get("MAKE_AUTH").split(":")[0] + ":",
      applicationTags = [
        thimbleAppTag + "project"
      ];

  return {

    /**
     * Check whether the requesting user is authenticated through Persona.
     */
    checkForPersonaAuth: function(req, res, next) {
      if (!req.session.email) {
        return next(new Error("please log in first"));
      }
      next();
    },

    /**
     * Check to see whether a page request is actually for some page.
     */
    requestForId: function(req, res, next) {
      if(!req.params.id) {
        return next(new Error("request did not point to a project"));
      }
      next();
    },

    /**
     * Check to see if a publish attempt actually has data for publishing.
     */
    checkForPublishData: function(req, res, next) {
      if(!req.body.html || req.body.html.trim() === "") {
        return next(new Error("no data to publish"));
      }
      next();
    },

    /**
     * Ensure there is a variable that indicates what this
     * page is a remix of. If there is no 'original', then
     * this will be an empty string.
     */
    checkForOriginalPage: function(req, res, next) {
      if(!req.body['original-url']) {
        req.body['original-url'] = "";
      } else {
        var idPos = req.body['original-url'].lastIndexOf('/') + 1;
        req.body['original-url'] = req.body['original-url'].substring(idPos);
      }
      next();
    },

    /**
     * Publish a page to the database. If it's a publish by
     * the owning user, update. Otherwise, insert.
     */
    saveData: function(db, hostName) {
      return function(req, res, next) {
        var options = {
          userid: req.session.email,
          originalURL: req.body['original-url'],
          rawData: req.body.html,
          sanitizedData: req.body.sanitizedHTML
        };
        db.write(options, function(err, result) {
          if (err) {
            metrics.increment('project.save.error');
          } else {
            req.publishId = result.id;
            metrics.increment('project.save.success');
          }
          next(err);
        });
      };
    },

    finalizeProject: function(nunjucksEnv, env) {
      var generateOGData = function(metaData, url) {
        var metaTags = [{
          "name": "og:url",
          "content": url
          },{
            "name": "og:updated_time",
            "content": new Date()
          },{
            "name": "og:site_name",
            "content": "Mozilla Webmaker"
          }];

        for(var tag in metaData ) {
          if (metaData.hasOwnProperty(tag)) {
            metaTags.push({
              "name": "og:" + tag,
              content: metaData[ tag ]
            });
          }
        }
        return metaTags;
      };

      var bodyRegExp = /<body([^>]*)>/;

      return function(req, res, next) {
        var sanitized = req.body.sanitizedHTML,
            hostname = env.get("HOSTNAME"),
            // OpenGraph information (in head):
            metaTagTemplate = nunjucksEnv.getTemplate("ogMetaTags.html"),
            metaTagsRender = metaTagTemplate.render({
              metaTags: generateOGData(req.body.metaData, hostname + "/remix/" + req.publishId)
            }),
            finalized = sanitized.replace("</head", metaTagsRender + "</head");

        // google analytics are env-conditional (injected in head):
        if (env.get("GA_ACCOUNT")) {
          var gaTemplate = nunjucksEnv.getTemplate("ga.html"),
              ga = gaTemplate.render({
                GA_ACCOUNT: env.get("GA_ACCOUNT"),
                GA_DOMAIN: env.get("GA_DOMAIN")
              });
          finalized = finalized.replace("</head", ga + "</head");
        }

        // "Remix this" link (injected in body):
        var remixTemplate = nunjucksEnv.getTemplate("remixTemplate.html"),
            remixThis = remixTemplate.render({
              cssUrl: hostname + "/stylesheets",
              mixUrl: hostname + "/remix/" + req.publishId + "/edit"
            });
        finalized = finalized.replace(bodyRegExp, "<body$1>" + remixThis);

        req.body.finalizedHTML = finalized;
        next();
      };
    },

    /**
     * Publish a page to S3. If it's a publish by
     * the owning user, this effecs an update. Otherwise,
     * this will create a new S3 object (=page).
     */
    publishData: function(options) {
      var knox = require("knox"),
          s3 = knox.createClient(options);

      return function(req, res, next) {
        var pageId = req.publishId,
            userId = req.session.email.split("@")[0].replace(/\./g,"-"),
            data = req.body.finalizedHTML,
            headers = {
              'x-amz-acl': 'public-read',
              'Content-Length': Buffer.byteLength(data,'utf8'),
              'Content-Type': 'text/html;charset=UTF-8'
            };

        // TODO: proper mapping for old->new ids.
        // See: https://bugzilla.mozilla.org/show_bug.cgi?id=862911
        var location = "/" + userId + "/" + pageId;

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
              req.publishedUrl = s3.url(location);
              metrics.increment('project.publish.success');
              next();
            } else {
              metrics.increment('project.publish.error');
              next(new Error("failure during publish step (error "+res.statusCode+")"));
            }
          })
          .end(data);
      };
    },

    /**
     * Turn the S3 URL into a user subdomain
     */
    rewriteUrl: function(domain) {
      var url = require("url");

      if (!domain) {
        return function(req, res, next) {
          next();
        };
      }

      domain = url.parse(domain);

      return function(req, res, next) {
        var originalURL = url.parse(req.publishedUrl).pathname.match(/\/(.+?)(\/.+)/),
            path = originalURL[2],
            subdomain = originalURL[1];

        req.publishedUrl = domain.protocol + "//" + subdomain + "." + domain.host + path;
        next();
      };
    },

    /**
     * Publish a page to the makeAPI. If it's "our" page,
     * update, otherwise, create.
     */
    publishMake: function(make) {
      return function(req, res, next) {
        var metaData = req.body.metaData || {},
            options = {
              maker: req.session.email,
              make: {
                thumbnail: metaData.thumbnail,
                contentType: "application/x-thimble",
                title: metaData.title || "",
                description: metaData.description || "",
                author: metaData.author || "",
                locale: metaData.locale || "",
                email: req.session.email,
                url: req.publishedUrl,
                tags: metaData.tags || [],
                appTags: applicationTags
              }
            };

        // connect to makeAPI and publish
        make.publish(options, function(err, result) {
          // We don't stop thimble because of errors in the makeapi yet.
          // We know this has errors, and are fixing it, for now, keep going.
          // Problems with server side auth. See: https://bugzilla.mozilla.org/show_bug.cgi?id=865439
          if (err) {
            metrics.increment('makeapi.publish.error');
          } else {
            metrics.increment('makeapi.publish.success');
          }
          next();
        });
      };
    }
  };
};
