var env = require('./environment');

module.exports = function middlewareConstructor() {
  var metrics = require('./metrics')(),
      utils = require("./utils"),
      hood = require("hood"),
      emulate_s3 = env.get('S3_EMULATION') || !env.get('S3_KEY'),
      knox = emulate_s3 ? require("noxmox").mox : require("knox"),
      Cryptr = require("cryptr");

  var cryptr = new Cryptr(env.get("SESSION_SECRET"));

  return {
    /**
     * Content Security Policy HTTP response header
     * helps you reduce XSS risks on modern browsers
     * by declaring what dynamic resources are allowed
     * to load via a HTTP Header.
     */
    addCSP: function ( options ) {
      return hood.csp({
        headers: [
          "Content-Security-Policy-Report-Only"
        ],
        policy: {
          'connect-src': [
            "'self'",
            "wss://hub.togetherjs.com"
          ],
          'default-src': [
            "'self'"
          ],
          'frame-src': [
            "'self'",
            "https://docs.google.com",
            options.brambleHost,
            options.personaHost
          ],
          'font-src': [
            "'self'",
            "https://togetherjs.com",
            "https://fonts.gstatic.com",
            "https://netdna.bootstrapcdn.com"
          ],
          'img-src': [
            "*"
          ],
          'media-src': [
            "*"
          ],
          'script-src': [
            "'self'",
            "http://mozorg.cdn.mozilla.net",
            "http://*.newrelic.com",
            "https://*.newrelic.com",
            "https://ajax.googleapis.com",
            "https://mozorg.cdn.mozilla.net",
            "https://www.google-analytics.com",
            options.personaHost,
            options.togetherJS
          ],
          'style-src': [
            "'self'",
            "http://mozorg.cdn.mozilla.net",
            "https://ajax.googleapis.com",
            "https://fonts.googleapis.com",
            "https://mozorg.cdn.mozilla.net",
            "https://togetherjs.com",
            "https://netdna.bootstrapcdn.com"
          ]
        }
      });
    },
    /**
     * The operation for the / route is special,
     * and never an edit or remix.
     */
    setNewPageOperation: function(req, res, next) {
      req.body.pageOperation = "create";
      next();
    },

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
      if (!req.session.user) {
        return next(utils.error(500, req.gettext("please log in first")));
      }
      next();
    },

    /**
     * Check to see whether a page request is actually for some page.
     */
    requestForId: function(req, res, next) {
      if(!req.params.id) {
        return next(utils.error(500, req.gettext("request did not point to a project")));
      }
      next();
    },

    /**
     * Check to see if a publish attempt actually has data for publishing.
     */
    checkForPublishData: function(req, res, next) {
      if(!req.body.html || req.body.html.trim() === "") {
        return next(utils.error(500, req.gettext("no data to publish")));
      }
      next();
    },

    /**
     * Ensure a publish has metadata. If not default it to an empty object.
     */
    ensureMetaData: function(req, res, next) {
      if(!req.body.metaData) {
        req.body.metaData = {};
      }
      next();
    },

    /**
     * Sanitize metadata so that there's no raw HTML in it
     */
    sanitizeMetaData: function(req, res, next) {
      var escapeHTML = function(content) {
            return content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
          },
          metaData = req.body.metaData,
          prop;
      for(prop in metaData) {
        if(metaData.hasOwnProperty(prop)) {
          metaData[prop] = escapeHTML(metaData[prop]);
        }
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
            return next(utils.error(500, err));
          }

          // We own this page, so an edit is safe.
          if (req.body.pageOperation === "edit" && result.userid === req.session.user.email) {
            // We need to know if an edit changed the title,
            // so we can update the old project by the old url.
            if (req.body.metaData.title !== result.title) {
              req.oldUrl = result.url;
            }
            return next();
          }

          // Otherwise, we don't own this page. Go to a remix instead.
          req.body.remixedFromURL = result.url;
          req.body.pageOperation = "remix";
          next();
        });
      };
    },

    /**
     * Do we use plain or proxy-fixed HTML?
     */
    sanitizeHTML: function(req, res, next) {
      req.body.sanitizedHTML = (req.body.proxied !== false && req.body.proxied !== "false") ? req.body.proxied : req.body.html;
      next();
    },

    /**
     * Publish a page to the database. If it's a publish by
     * the owning user, update. Otherwise, insert.
     */
    saveData: function(db, hostName) {
      return function(req, res, next) {
        if (req.body.metaData.title) {
          req.pageTitle = utils.slugify(req.body.metaData.title);
        } else {
          req.pageTitle = "";
        }

        var options = {
          edit: (req.body.pageOperation === "edit"),
          origin: req.body.origin,
          remixedFrom: req.body.remixedFromURL,
          rawData: req.body.html,
          title: req.pageTitle,
          userid: req.session.user.email
        };

        db.write(options, function(err, result) {
          if (err) {
            metrics.increment('project.save.error');
            return next(utils.error(500, err));
          }
          req.publishId = result.id;
          metrics.increment('project.save.success');
          next();
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
          userid: req.session.user.email,
          url: req.publishedUrl
        };
        db.updateUrl(options, function(err, project) {
          if (err) {
            return next(utils.error(500, err));
          }
          req.project = project;
          next();
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
            return next(utils.error(500, err));
          }
          // This means we don't have a remix to worry about
          if (!result.remixedFrom) {
            return next();
          }
          make.search({url: result.remixedFrom}, function(err, makes) {
            if (err) {
              return next(utils.error(500, err));
            }
            if (makes.length === 1) {
              req.body.remixedFromMakeId = makes[0]._id;
            }
            next();
          });
        });
      };
    },

    rewritePublishId: function(db) {
      return function(req, res, next) {
        // If the user hasn't defined a title, the publishId
        // does double duty as ersatz page title.
        if (!req.pageTitle) {
          req.pageTitle = req.publishId;
          return next();
        }
        next();
      };
    },

    generateUrls: function(appName, s3Url, domain, db) {
      var url = require("url"),
          s3 = knox.createClient(s3Url);

      return function(req, res, next) {
        db.find(req.publishId, function(err, project) {
          if (err) {
            return next(err);
          }

          var subdomain = req.session.user.username,
              idHash = utils.hashProjectId(req.publishId),
              path = "/" + appName;

          // is this an old-style, project-hash-less URL?
          // if so, we should not add the project hash now.
          if (!project.url || (project.url && utils.usesIdHash(project.url))) {
            path += "/" + idHash;
          }

          // Do we have a real title? If so, add it
          // to the URL. If not, don't bother.
          if (req.pageTitle !== req.publishId) {
            path += "/" + req.pageTitle;
          }

          req.publishLocation = "/" + subdomain + path;
          req.s3Url = s3.url(req.publishLocation);

          // Used for make API if USER_SUBDOMAIN exists
          if (domain) {
            domain = url.parse(domain);
            req.customUrl = domain.protocol + "//" + subdomain + "." + domain.host + path;
          }

          next();
        });
      };
    },

    finalizeProject: function(hostname) {
      return function(req, res, next) {
        var htmlData = req.body.sanitizedHTML,
            remixUrl = hostname + "/project/" + req.publishId + "/remix",

            // Ensure that external links target _blank (unless the user
            // already specified a target, in which case we do nothing)
            fixExternalLinks = function fixExternalLinks() {
              function pointToBlank(a) {
                var href = a.getAttribute("href");
                if (href && href.indexOf("//") > -1) {
                  // this is an external link.
                  if(!a.getAttribute("target")) {
                    a.setAttribute("target", "_blank");
                  }
                }
              }
              function fixLinks() {
                document.removeEventListener("DOMContentLoaded", fixLinks);
                var anchors = document.querySelectorAll("a");
                var asArray = Array.prototype.slice.call(anchors);
                asArray.forEach(function(a) {
                  pointToBlank(a);
                });
              }
              document.addEventListener("DOMContentLoaded", fixLinks);
            };

            var linkCorrection = "<script>(" + fixExternalLinks.toString() + "())</script>\n";

        // combine all the content blocks.
        req.remixUrl = remixUrl;
        req.body.finalizedHTML = htmlData.replace("</head", linkCorrection + "</head");
        next();
      };
    },

    /**
     * Publish a page to S3. If it's a publish by
     * the owning user, this effects an update. Otherwise,
     * this will create a new S3 object (=page).
     */
    publishData: function(options) {
      // NOTE: workaround until https://github.com/LearnBoost/knox/issues/194 is addressed.
      //       this line prevents knox from forming url-validation-failing S3 URLs.
      if(!options.port) { delete options.port; }

      var s3 = knox.createClient(options);

      return function(req, res, next) {
        var userId = req.session.user.username,
            data = req.body.finalizedHTML,
            headers = {
              'x-amz-acl': 'public-read',
              'Content-Length': Buffer.byteLength(data,'utf8'),
              'Content-Type': 'text/html;charset=UTF-8'
            };

        var location = req.publishLocation,
            s3Error = utils.error(500, "failure during publish step (error "+res.statusCode+")"),
            s3PublishError = utils.error(500, req.gettext("There was a problem publishing the page. Your page has been saved") +
                                       " with id "+req.publishId+", so you can edit it, but it could not be"+
                                       " published to the web.");

        // write data to S3
        s3.put(location + "_", headers)
          .on("error", next)
          .on("response", function(res) {
            if (res.statusCode !== 200) {
              metrics.increment('project.publish.error');
              return next(s3Error);
            }

            req.publishedUrl = s3.url(location);
            metrics.increment('project.publish.success');
            next();
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
        var metaData = req.body.metaData,
            project = req.project,
            options = {
              thumbnail: metaData.thumbnail,
              contentType: "application/x-bramble",
              title: metaData.title || req.pageTitle,
              description: metaData.description || "",
              author: metaData.author || "",
              locale: metaData.locales || req.localeInfo.locale || "en_US",
              email: req.session.user.email,
              url: req.publishedUrl,
              remixurl: req.remixUrl,
              editurl: req.remixUrl.replace( /remix$/, "edit" ),
              contenturl: req.publishedUrl + "_",
              remixedFrom: req.body.remixedFromMakeId,
              tags: metaData.tags ? metaData.tags.split(",") : [],
              published: metaData.published === "true" || false
            };

        function finalizePublishMake(err, result) {
          if (err) {
            metrics.increment('makeapi.publish.error');
            return next(utils.error(500, err));
          }

          metrics.increment('makeapi.publish.success');
          next();
        }

        if (project.makeid) {
          make.update(project.makeid, options, finalizePublishMake);
        } else {

          make.search({
            email: req.session.user.email,
            url: req.oldUrl || req.publishedUrl
          }, function(err, results) {
            if (err) {
              return finalizePublishMake(err);
            }

            var result = results[0];

            if (result) {
              project.updateAttributes({ makeid: result.id })
              .error(function(err) {
                return next(utils.error(500, err));
              })
              .success(function(updatedProject) {
                req.project = updatedProject;
                make.update(updatedProject.makeid, options, finalizePublishMake);
              });
            } else {
              make.create(options, function( err, make ) {
                if (err) {
                  process.nextTick(function() {
                    return next(utils.error(500, err));
                  });
                  return;
                }

                project.updateAttributes({ makeid: make.id })
                .error(function(err) {
                  return next(utils.error(500, err));
                })
                .success(function(updatedProject) {
                  req.project = updatedProject;
                  finalizePublishMake( err, make );
                });
              });
            }
          });
        }
      };
    },

    /**
     * Unpublish (delete/remove) a project.
     */
    deleteProject: function(databaseAPI) {
      return function(req, res, next) {
        databaseAPI.destroy(req.requestId, function(err, project) {
          if(err) {
            return next(utils.error(500, err));
          }
          res.json({"status": 200});
        });
      };
    },

    /**
     * If there's an oauth token, decrypt it and set the
     * local user object.
     */
    setUserIfTokenExists: function(req, res, next) {
      if (!req.session || !req.session.token) {
        return next();
      }

      // Decrypt oauth token
      req.user = req.session.user;
      req.user.token = cryptr.decrypt(req.session.token);

      next();
    }
  };
};
