module.exports = function middlewareConstructor(env) {

  var metrics = require('./metrics')(env),
      utils = require("./utils"),
      emulate_s3 = env.get('S3_EMULATION') || !env.get('S3_KEY'),
      knox = emulate_s3 ? require("noxmox").mox : require("knox");

  return {
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
      if (!req.session.email || !req.session.username) {
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
            return next(err);
          }

          // We own this page, so an edit is safe.
          if (req.body.pageOperation === "edit" && result.userid === req.session.email) {
            // We need to know if an edit changed the title,
            // so we can update the old project by the old url.
            if (req.body.metaData.title !== result.title) {
              req.oldUrl = result.url;
            }
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
     * Check whether a title is already taken
     */
    checkTitleAvailability: function(db, callback) {
      return function(req, res, next) {
        var options = {
          userid: req.session.email,
          title: utils.slugify(decodeURIComponent(req.body.metaData.title))
        };
        db.findBy(options, function(err, result) {
          // genuine error
          if (err) {
            res.locals.titleAvailability = 500;
          }
          // "conflict": The request could not be completed due to a conflict
          //             with the current state of the resource. This code is
          //             only allowed in situations where it is expected that
          //             the user might be able to resolve the conflict and
          //             resubmit the request.
          //
          // second conditional: "title used by this user, but for another project"
          else if (result && (req.body.pageOperation === "remix" || result.id != req.body.origin)) {
            res.locals.titleAvailability = 409;
          }
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
        if (req.body.metaData.title) {
          req.pageTitle = utils.slugify(req.body.metaData.title);
        } else {
          req.pageTitle = "";
        }

        var options = {
          edit: (req.body.pageOperation === "edit"),
          origin: req.body.origin,
          remixedFrom: req.body.remixedFrom,
          rawData: req.body.html,
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
        db.updateUrl(options, function(err, project) {
          if (err) {
            return next(err);
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
            return next(req.gettext("You already have a page titled") + ' "' + req.pageTitle + '" ' +
                        req.gettext("you will have to choose a new title"));
          }

          next();
        });
      };
    },

    generateUrls: function(appName, s3Url, domain) {
      var url = require("url"),
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
      var generateMetaData = function(metaData, url) {
        var content = "",
            metaTags = [{
              "name": "og:url",
              "content": url
            },{
              "name": "og:updated_time",
              "content": (new Date()).toString()
            },{
              "name": "og:site_name",
              "content": "Mozilla Webmaker"
            }];

        for(var tag in metaData ) {
          if (metaData.hasOwnProperty(tag)) {
            content = metaData[ tag ];
            if (Array.isArray(content)) {
              content = content.join();
            } else if (typeof content !== "string") {
              content = "";
            }

            metaTags.push({
              "name": "og:" + tag,
              content: content
            });
          }
        }
        return metaTags;
      };

      var bodyRegExp = /<body([^>]*)>/;

      return function(req, res, next) {
        var htmlData = req.body.sanitizedHTML,
            hostname = env.get("APP_HOSTNAME"),
            metaData = req.body.metaData,
            remixUrl = hostname + "/project/" + req.publishId + "/remix",
            detailsTemplate = nunjucksEnv.getTemplate('details.html'),
            metaTagTemplate = nunjucksEnv.getTemplate("metaTags.html"),
            googleTemplate = nunjucksEnv.getTemplate("googleanalytics.html"),
            url = req.customUrl || req.s3Url,

            // prevent index robots from following outbound links
            noFollow = '<meta name="robots" content="nofollow">\n';

            // Ensure that external links target _blank (unless the user
            // already specified a target, in which case we do nothing)
            var fixExternalLinks = function fixExternalLinks() {
              function pointToBlank(a) {
                var href = a.getAttribute("href");
                if (href && href.indexOf("://") > -1) {
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

            // OpenGraph information
            metaTagsBlock = metaTagTemplate.render({
              metaTags: generateMetaData(metaData, hostname + "/project/" + req.publishId)
            }),

            // google analytics
            googleAnalytics = googleTemplate.render(res.app.locals);

            // embed shell
            embedShell = detailsTemplate.render({
              HOSTNAME: hostname,
              URL: escape( url ),
              AUDIENCE: env.get( "AUDIENCE" ),
              REMIX_URL: remixUrl,
              THIMBLE_PROJECT: req.s3Url + "_",
              TITLE: metaData.title
            });

        // combine all the content blocks.
        embedShell = embedShell.replace("</head", metaTagsBlock + googleAnalytics + "</head");
        req.remixUrl = remixUrl;
        req.body.embedShell = embedShell;
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
        var userId = req.session.username,
            data = req.body.finalizedHTML,
            headers = {
              'x-amz-acl': 'public-read',
              'Content-Length': Buffer.byteLength(data,'utf8'),
              'Content-Type': 'text/html;charset=UTF-8'
            };

        // TODO: proper mapping for old->new ids.
        // See: https://bugzilla.mozilla.org/show_bug.cgi?id=862911
        var location = req.publishLocation,
            // FIXME: Plan for S3 being down. This is not the ideal error handling,
            //        but is a working stub in lieu of a proper solution.
            // See: https://bugzilla.mozilla.org/show_bug.cgi?id=865738
            s3PublishError = utils.error(500, req.gettext("There was a problem publishing the page. Your page has been saved") +
                                       " with id "+req.publishId+", so you can edit it, but it could not be"+
                                       " published to the web."),
            s3Error = utils.error(500, "failure during publish step (error "+res.statusCode+")");

        // write data to S3
        s3.put(location + "_", headers)
          .on("error", function(err) {
            next(s3PublishError);
          })
          .on("response", function(res) {
            if (res.statusCode === 200) {
              var embedShell = req.body.embedShell;
              headers = {
                'x-amz-acl': 'public-read',
                'Content-Length': Buffer.byteLength(embedShell,'utf8'),
                'Content-Type': 'text/html;charset=UTF-8'
              };
              s3.put(location, headers)
                .on("error", function(err) {
                  next(s3PublishError);
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
                    next(s3Error);
                  }
                })
                .end(embedShell);
            } else {
              metrics.increment('project.publish.error');
              next(s3Error);
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
        var metaData = req.body.metaData,
            project = req.project,
            options = {
              thumbnail: metaData.thumbnail,
              contentType: "application/x-thimble",
              title: metaData.title || req.pageTitle,
              description: metaData.description || "",
              author: metaData.author || "",
              locale: metaData.locale || req.localeInfo.locale || "en_US",
              email: req.session.email,
              url: req.publishedUrl,
              contenturl: req.publishedUrl + "_",
              remixedFrom: req.body.remixedFrom,
              remixUrl: req.remixUrl,
              tags: metaData.tags ? metaData.tags.split(",") : []
            };

        function finalizePublishMake(err, result) {
          if (err) {
            metrics.increment('makeapi.publish.error');
            return next(err);
          }

          metrics.increment('makeapi.publish.success');
          next();
        }

        if (project.makeid) {
          make.update(project.makeid, options, finalizePublishMake);
        } else {

          make.search({
            email: req.session.email,
            url: req.oldUrl || req.publishedUrl
          }, function(err, results) {
            if (err) {
              return finalizePublishMake(err);
            }

            var result = results[0];

            if (result) {
              project.updateAttributes({ makeid: result.id })
              .error(function(err) {
                return next(err);
              })
              .success(function(updatedProject) {
                req.project = updatedProject;
                make.update(updatedProject.makeid, options, finalizePublishMake);
              });
            } else {
              make.create(options, function( err, make ) {
                project.updateAttributes({ makeid: make.id })
                .error(function(err) {
                  return next(err);
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
            next(err);
          }
          res.json({"status": 200});
        });
      };
    }
  };
};
