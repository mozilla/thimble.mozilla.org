module.exports = function middlewareConstructor(env) {

  var metrics = require('./metrics')(env),
      thimbleAppTag = env.get("MAKE_AUTH").split(":")[0] + ":",
      utils = require("./utils"),
      applicationTags = [
        thimbleAppTag + "project"
      ];

  return {
    /**
     * By default, the publish operation is to create a new
     * page. Later functions can override this behaviour.
     */
    setDefaultPublishOperation: function(req, res, next) {
      req.body.pageOperation = "remix";
      next();
    },

    /**
     * Override the default publication operation to act
     * as an update, rather than a create. This will lead
     * to old data being overwritten upon publication.
     */
    setPublishAsUpdate: function(req, res, next) {
      req.body.pageOperation = "edit";
      next();
    },

    /**
     * Check whether the requesting user is authenticated through Persona.
     */
    checkForAuth: function(req, res, next) {
      if (!req.session.email || !req.session.username) {
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
     * Ensure we're safe to do an edit, if not, force a remix.
     */
    checkPageOperation: function(db) {
      return function(req, res, next) {
        var originalId = req.body.origin;
        // Ensure we are doing an edit on an existing project.
        if (!originalId) {
          return next();
        }

        // Verify that the currently logged in user owns
        // this page, otherwise they might try to update
        // a non-existent page when they hit "publish".
        db.find(originalId, function(err, result) {
          if(err) {
            return next(err);
          }

          // We own this page, so an edit is safe.
          if (req.body.pageOperation === "edit" && result.userid === req.session.email) {
            return next();
          }

          // Otherwise, we don't own this page. Go to a remix instead.
          req.body.remixedFrom = result.url;
          req.body.pageOperation = "remix";
          next();
        });
      };
    },

    /**
     * Publish a page to the database. If it's a publish by
     * the owning user, update. Otherwise, insert.
     */
    saveData: function(db, hostName) {
      return function(req, res, next) {
        if (req.body.metaData) {
          req.pageTitle = utils.slugify(req.body.metaData.title);
        } else {
          req.pageTitle = "";
        }

        var options = {
          edit: (req.body.pageOperation === "edit"),
          origin: req.body.origin,
          remixedFrom: req.body.remixedFrom,
          rawData: req.body.html,
          sanitizedData: req.body.sanitizedHTML,
          title: req.pageTitle,
          userid: req.session.email
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

    /**
     * Update the database to store the URL created from S3
     */
    saveUrl: function(db) {
      return function(req, res, next) {
        var options = {
          id: req.publishId,
          userid: req.session.email,
          url: req.publishedUrl
        };
        db.updateUrl(options, function(err) {
          next(err);
        });
      };
    },

    /**
     * Find the make id of the project this was remixed from
     */
    getRemixedFrom: function(db, make) {
      return function(req, res, next) {
        db.find(req.publishId, function(err, result) {
          if (err) {
            return next(err);
          }
          // This means we don't have a remix to worry about
          if (!result.remixedFrom) {
            return next();
          }
          make.search({url: result.remixedFrom}, function(err, makes) {
            if (err) {
              return next(err);
            }
            if (makes.length === 1) {
              req.body.remixedFrom = makes[0]._id;
            }
            next();
          });
        });
      };
    },

    rewritePublishId: function(db) {
      return function(req, res, next) {
        // If the user hasn't defined a title, just use the publishId as-is
        if (!req.pageTitle) {
          req.pageTitle = req.publishId;
          return next();
        }

        // is this an edit or supposed to be a new page?
        var edit = (req.body.pageOperation === "edit");

        db.count({
          userid: req.session.email,
          title: req.pageTitle
        }, function(err, count) {
          if (err) {
            return next(err);
          }

          if (!edit && count > 1) {
            return next('You already have a page titled "' + req.pageTitle +
                        '" (you will have to change the text in the <title> element on your page)');
          }

          next();
        });
      };
    },

    generateUrls: function(appName, s3Url, domain) {
      var url = require("url"),
          knox = require("knox"),
          s3 = knox.createClient(s3Url);

      return function(req, res, next) {
        var subdomain = req.session.username,
            path = "/" + appName + "/" + req.pageTitle;

        // Used by s3
        req.publishLocation = "/" + subdomain + path;
        req.s3Url = s3.url(req.publishLocation);

        // Used for make API if USER_SUBDOMAIN exists
        if (domain) {
          domain = url.parse(domain);
          req.customUrl = domain.protocol + "//" + subdomain + "." + domain.host + path;
        }

        next();
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
            metaData = req.body.metaData || {},
            remixUrl = hostname + "/project/" + req.publishId + "/remix",
            detailsTemplate = nunjucksEnv.getTemplate('details.html'),
            url = req.customUrl || req.s3Url,
            detailsRendered = detailsTemplate.render({
              HOSTNAME: hostname,
              URL: escape( url ),
              AUDIENCE: env.get( "AUDIENCE" ),
              REMIX_URL: remixUrl
            }),

            // OpenGraph information (in head):
            metaTagTemplate = nunjucksEnv.getTemplate("ogMetaTags.html"),
            metaTagsRender = metaTagTemplate.render({
              metaTags: generateOGData(metaData, hostname + "/project/" + req.publishId)
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

        finalized = finalized.replace(bodyRegExp, "<body$1>" + detailsRendered);
        req.remixUrl = remixUrl;

        req.body.finalizedHTML = finalized;
        next();
      };
    },

    /**
     * Publish a page to S3. If it's a publish by
     * the owning user, this effects an update. Otherwise,
     * this will create a new S3 object (=page).
     */
    publishData: function(options) {
      var knox = require("knox"),
          s3 = knox.createClient(options);

      return function(req, res, next) {
        var userId = req.session.username,
            data = req.body.finalizedHTML,
            headers = {
              'x-amz-acl': 'public-read',
              'Content-Length': Buffer.byteLength(data,'utf8'),
              'Content-Type': 'text/html;charset=UTF-8'
            };

        // TODO: proper mapping for old->new ids.
        // See: https://bugzilla.mozilla.org/show_bug.cgi?id=862911
        var location = req.publishLocation;

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

              // publish .../edit and .../remix redirecting routes to S3 as well.
              var target = req.remixUrl.replace(/\/remix$/,'');
              ["edit","remix"].forEach(function(suffix) {
                var thimbletarget = target + '/'+ suffix;
                var s3target = location + '/' + suffix;

                // This currently uses meta-refresh, but should be switched over to
                // native S3 redirect headers instead, once we figure out how.
                // SEE: https://bugzilla.mozilla.org/show_bug.cgi?id=876763
                var redirect = "<!doctype html><html><head><meta http-equiv='refresh' content='0; url="+thimbletarget+"'></head><body></body></html>";

                headers = {
                  'x-amz-acl': 'public-read',
                  'Content-Length': Buffer.byteLength(redirect,'utf8'),
                  'Content-Type': 'text/html;charset=UTF-8'
                };

                // NOTE: failure to set up the /edit and /remix links
                //       should not actually break publishing, so we
                //       don't catch on(error) or on(response).
                s3.put(s3target, headers).end(redirect);
              });

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
    rewriteUrl: function(req, res, next) {
      if (req.customUrl) {
        req.publishedUrl = req.customUrl;
      }
      next();
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
                remixedFrom: req.body.remixedFrom,
                remixUrl: req.remixUrl,
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
