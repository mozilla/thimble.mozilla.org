var env = require('./environment');
var multer = require("multer");
var upload = multer({
  dest: require("os").tmpdir(),
  limits: {
    fileSize: env.get("MAX_FILE_SIZE_BYTES")
  }
});
var request = require("request");
var querystring = require("querystring");
var uuid = require("uuid");

var publishHost = env.get("PUBLISH_HOSTNAME");

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
     * Multipart File Upload of a single `brambleFile` form field
     */
    fileUpload: upload.single("brambleFile"),

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
            "'self'"
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
            options.brambleHost,
            options.personaHost
          ],
          'style-src': [
            "'self'",
            "http://mozorg.cdn.mozilla.net",
            "https://ajax.googleapis.com",
            "https://fonts.googleapis.com",
            "https://mozorg.cdn.mozilla.net",
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
     * Check whether the requesting user has been authenticated.
     */
    checkForAuth: function(req, res, next) {
      if (!req.session.user) {
        return res.redirect(301, "/");
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
    saveData: function(db) {
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

    rewritePublishId: function() {
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

    finalizeProject: function() {
      return function(req, res, next) {
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
        var data = req.body.finalizedHTML,
            headers = {
              'x-amz-acl': 'public-read',
              'Content-Length': Buffer.byteLength(data,'utf8'),
              'Content-Type': 'text/html;charset=UTF-8'
            };

        var location = req.publishLocation,
            s3Error = utils.error(500, "failure during publish step (error "+res.statusCode+")");

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

        function finalizePublishMake(err) {
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
        databaseAPI.destroy(req.requestId, function(err) {
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
    },

    redirectAnonymousUsers: function(req, res, next) {
      var qs = querystring.stringify(req.query);
      if(qs !== "") {
        qs = "?" + qs;
      }

      if(req.session.user) {
        next();
      } else {
        res.redirect(307, "/anonymous/" + uuid.v4() + qs);
      }
    },

    /**
     * Validate the request payload based on the properties passed in
     */
    validateRequest: function(properties) {
      return function(req, res, next) {
        var valid = !!req.body && properties.every(function(prop) {
          return req.body[prop] !== null && req.body[prop] !== undefined;
        });

        if(!valid) {
          next(utils.error(400, "Request body missing data"));
        } else {
          next();
        }
      };
    },

    /**
     * Login with publish.webmaker.org for the user (if authenticated) and
     * set it on the request's `user` property which should be set by calling
     * the `setUserIfTokenExists` middleware operation
     */
    setPublishUser: function(req, res, next) {
      var user = req.user;

      if(!user) {
        next();
        return;
      }

      request({
        method: "POST",
        url: publishHost + "/users/login",
        headers: {
          "Authorization": "token " + user.token
        },
        body: {
          name: user.username
        },
        json: true
      }, function(err, response, body) {
        if(err) {
          next(utils.error(500));
          return;
        }

        if(response.statusCode !== 200 &&  response.statusCode !== 201) {
          next(utils.error(response.statusCode, response.body));
          return;
        }

        req.user.publishId = body.id;
        next();
      });
    },

    /* Sets the project for the current request based on the project
     * id provided as a parameter. The request's `user` property must
     * be set by calling the `setUserIfTokenExists` middleware operation.
     */
    setProject: function(req, res, next) {
      var projectId = req.params.projectId;
      if(!projectId || !req.user) {
        req.project = null;
        next();
        return;
      }

      // Get project data from publish.wm.org
      request.get({
        url: publishHost + "/projects/" + projectId,
        headers: {
          "Authorization": "token " + req.user.token
        }
      }, function(err, response, body) {
        if(err) {
          next(utils.error(500));
          return;
        }

        if(response.statusCode !== 200) {
          next(utils.error(response.statusCode, response.body));
          return;
        }

        req.project = JSON.parse(body);

        next();
      });
    },

    /**
     * Logging in stores a flag in the session so the server
     * knows where to redirect a user. We need to make sure
     * this flag is removed in every circumstance but the
     * final login redirect
     */
    clearRedirects: function(req, res, next) {
      delete req.session.home;
      next();
    }
  };
};
