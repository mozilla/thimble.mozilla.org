"use strict";

let multer = require("multer");
let request = require("request");
let querystring = require("querystring");
let uuid = require("uuid");
let cors = require("cors");
let Cryptr = require("cryptr");

let env = require("./environment");
let HttpError = require("./http-error");

let upload = multer({
  dest: require("os").tmpdir(),
  limits: { fileSize: env.get("MAX_FILE_SIZE_BYTES") }
});
const publishHost = env.get("PUBLISH_HOSTNAME");

module.exports = function middlewareConstructor(config) {
  let cryptr = new Cryptr(env.get("SESSION_SECRET"));

  return {
    /**
     * Multipart File Upload of a single `brambleFile` form field
     */
    fileUpload: upload.single("brambleFile"),

    /**
     * Add CORS Headers to the response
     */
    enableCORS(whiteList) {
      whiteList = Array.isArray(whiteList) ? whiteList : [ whiteList ];
      return cors({
        origin(origin, callback) {
          callback(null, whiteList.indexOf(origin) !== -1);
        }
      });
    },

    /**
     * On the request, set the key to use for user error messages
     * Takes a function or a string. If it is a function,
     * it is called with the request to get the error message's key.
     */
    setErrorMessage(errorMessageKey) {
      return function(req, res, next) {
        req.errorMessageKey = typeof errorMessageKey === "function" ? errorMessageKey(req) : errorMessageKey;
        next();
       };
     },

    /**
     * Check whether the requesting user has been authenticated.
     * If not, render an error page asking them to explicitly
     * sign out and sign in again (to bust browser cache).
     */
    checkForAuth(req, res, next) {
      if(req.session.user) {
        return next();
      }

      res.set({
        "Cache-Control": "no-cache, no-store, must-revalidate"
      });

      res.render("sign-out.html", {
        logoutURL: config.logoutURL
      });
    },

    /**
     * If there's an oauth token, decrypt it and set the
     * local user object.
     */
    setUserIfTokenExists(req, res, next) {
      if (!req.session || !req.session.token) {
        return next();
      }

      // Decrypt oauth token
      req.user = req.session.user;
      req.user.token = cryptr.decrypt(req.session.token);

      next();
    },

    redirectAnonymousUsers(req, res, next) {
      let locale = (req.localeInfo && req.localeInfo.lang) ? req.localeInfo.lang : "en-US";
      let qs = querystring.stringify(req.query);
      if(qs !== "") {
        qs = `?${qs}`;
      }

      if(req.session.user) {
        next();
      } else {
        res.redirect(307, `/${locale}/anonymous/${uuid.v4()}${qs}`);
      }
    },

    /**
     * Validate the request payload based on the properties passed in
     */
    validateRequest(properties) {
      return function(req, res, next) {
        let valid = !!req.body &&
          properties.every(function(prop) {
            return req.body[prop] !== null && req.body[prop] !== undefined;
          });

        if(valid) {
          return next();
        }

        res.status(400);
        next(
          HttpError.format({
            message: `Data validation in middleware failed for ${req.originalUrl}`,
            context: {
              expected: properties,
              actual: req.body
            }
          }, req)
        );
      };
    },

    /**
     * Login with publish.webmaker.org for the user (if authenticated) and
     * set it on the request's `user` property which should be set by calling
     * the `setUserIfTokenExists` middleware operation
     */
    setPublishUser(req, res, next) {
      let user = req.user;
      if(!user) {
        return next();
      }

      let userUrl = `${publishHost}/users/login`;

      request({
        method: "POST",
        url: userUrl,
        headers: {
          "Authorization": `token ${user.token}`
        },
        body: {
          name: user.username
        },
        json: true
      }, function(err, response, body) {
        if(err) {
          res.status(500);
          return next(
            HttpError.format({
              message: `Failed to send request to ${userUrl}`,
              context: err
            }, req)
          );
        }

        if(response.statusCode !== 200 && response.statusCode !== 201) {
          res.status(response.statusCode);
          return next(
            HttpError.format({
              message: `Request to ${userUrl} returned a status of ${response.statusCode}`,
              context: response.body
            }, req)
          );
        }

        req.user.publishId = body.id;
        next();
      });
    },

    /* Sets the project for the current request based on the project
     * id provided as a parameter. The request's `user` property must
     * be set by calling the `setUserIfTokenExists` middleware operation.
     */
    setProject(req, res, next) {
      let projectId = req.params.projectId;
      if(!projectId || !req.user) {
        req.project = null;
        return next();
      }

      let projectUrl = `${publishHost}/projects/${projectId}`;

      // Get project data from publish.wm.org
      request.get({
        url: projectUrl,
        headers: {
          "Authorization": `token ${req.user.token}`
        }
      }, function(err, response, body) {
        if(err) {
          res.status(500);
          return next(
            HttpError.format({
              message: `Failed to send request to ${projectUrl}`,
              context: err
            }, req)
          );
        }

        if(response.statusCode !== 200) {
          res.status(response.statusCode);
          return next(
            HttpError.format({
              message: `Request to ${projectUrl} returned a status of ${response.statusCode}`,
              context: response.body
            }, req)
          );
        }

        try {
          req.project = JSON.parse(body);
        } catch(e) {
          res.status(500);
          return next(
            HttpError.format({
              message: "Project data received from the publish server was in an invalid format. Failed to run `JSON.parse`",
              context: e.message,
              stack: e.stack
            }, req)
          );
        }

        next();
      });
    },

    /**
     * Logging in stores a flag in the session so the server
     * knows where to redirect a user. We need to make sure
     * this flag is removed in every circumstance but the
     * final login redirect
     */
    clearRedirects(req, res, next) {
      delete req.session.home;
      next();
    }
  };
};
