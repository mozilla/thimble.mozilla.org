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

// Debug info flag for https://github.com/mozilla/thimble.mozilla.org/issues/2161
const ASSERT_TOKEN = env.get("ASSERT_TOKEN");

module.exports = function middlewareConstructor(config) {
  // Set up a token decryptor using the default cryptr 2.0.0 algorithm.
  let cryptr = new Cryptr(env.get("SESSION_SECRET"));

  // Set up a fallback decryptor that matches the cryptr 1.0.0 algorithm
  // https://github.com/MauriceButler/cryptr/compare/fabae97a61119d69f03fc189f7c95dda826c96b7...master#diff-168726dbe96b3ce427e7fedce31bb0bcR9
  let cryptrFallback = new Cryptr(env.get("SESSION_SECRET"), "aes256");

  return {
    /**
     * Multipart File Upload of a single `brambleFile` form field
     */
    fileUpload: upload.single("brambleFile"),

    /**
     * Add CORS Headers to the response
     */
    enableCORS(whiteList) {
      whiteList = Array.isArray(whiteList) ? whiteList : [whiteList];
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
        req.errorMessageKey =
          typeof errorMessageKey === "function"
            ? errorMessageKey(req)
            : errorMessageKey;
        next();
      };
    },

    /**
     * Check whether the requesting user has been authenticated.
     * If not, render an error page asking them to explicitly
     * sign out and sign in again (to bust browser cache).
     */
    checkForAuth(req, res, next) {
      if (req.session.user) {
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
      let token = (req.user.token = cryptr.decrypt(req.session.token));

      if (ASSERT_TOKEN) {
        /**
         * Assert whether or not this token is correct or rather broken.
         * We expect a 64 character HEX string for the token, for example:
         * '16d4c4d2fa4d6e4aa6b1b5c6a115ad44fd271dd98204f2008bf5efbba5a56dec'
         */
        let assert = function(token) {
          if (!token) {
            console.log("ASSERT_TOKEN FAILED: Expected token to exist");
            return false;
          }

          let tokenType = typeof token;

          if (tokenType !== "string") {
            console.log(
              "ASSERT_TOKEN FAILED: Expected token type to be String, instead got: " +
                tokenType
            );
            return false;
          }

          if (!/^[a-z0-9]{64}$/.test(token)) {
            console.log(
              "ASSERT_TOKEN FAILED: Expected token to only have chars a-z, 0-9. Also got: '" +
                token.replace(/[a-z0-9]/g, " ") +
                "'"
            );
            return false;
          }

          return true;
        };

        if (!assert(token)) {
          console.log(
            "ASSERT_TOKEN FAILED: retrying decryption using aes-256 rather than aes-256-ctr"
          );

          token = req.user.token = cryptrFallback.decrypt(req.session.token);

          if (!assert(token)) {
            return next(
              "Session token cannot be decrypted. Please sign out and sign in again."
            );
          }
        }
      }

      next();
    },

    redirectAnonymousUsers(req, res, next) {
      let locale =
        req.localeInfo && req.localeInfo.lang ? req.localeInfo.lang : "en-US";
      let qs = querystring.stringify(req.query);
      if (qs !== "") {
        qs = `?${qs}`;
      }

      if (req.session.user) {
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
        let valid =
          !!req.body &&
          properties.every(function(prop) {
            return req.body[prop] !== null && req.body[prop] !== undefined;
          });

        if (valid) {
          return next();
        }

        res.status(400);
        next(
          HttpError.format(
            {
              message: `Data validation in middleware failed for ${req.originalUrl}`,
              context: {
                expected: properties,
                actual: req.body
              }
            },
            req
          )
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
      if (!user) {
        return next();
      }

      let userUrl = `${publishHost}/users/login`;

      request(
        {
          method: "POST",
          url: userUrl,
          headers: {
            Authorization: `token ${user.token}`
          },
          body: {
            name: user.username
          },
          json: true
        },
        function(err, response, body) {
          if (err) {
            res.status(500);
            return next(
              HttpError.format(
                {
                  message: `Failed to send request to ${userUrl}`,
                  context: err
                },
                req
              )
            );
          }

          if (response.statusCode !== 200 && response.statusCode !== 201) {
            res.status(response.statusCode);
            return next(
              HttpError.format(
                {
                  message: `Request to ${userUrl} returned a status of ${response.statusCode}`,
                  context: response.body
                },
                req
              )
            );
          }

          req.user.publishId = body.id;
          next();
        }
      );
    },

    /* Sets the project for the current request based on the project
     * id provided as a parameter. The request's `user` property must
     * be set by calling the `setUserIfTokenExists` middleware operation.
     */
    setProject(req, res, next) {
      let projectId = req.params.projectId;
      if (!projectId || !req.user) {
        req.project = null;
        return next();
      }

      let projectUrl = `${publishHost}/projects/${projectId}`;

      // Get project data from publish.wm.org
      request.get(
        {
          url: projectUrl,
          headers: {
            Authorization: `token ${req.user.token}`
          }
        },
        function(err, response, body) {
          if (err) {
            res.status(500);
            return next(
              HttpError.format(
                {
                  message: `Failed to send request to ${projectUrl}`,
                  context: err
                },
                req
              )
            );
          }

          if (response.statusCode !== 200) {
            res.status(response.statusCode);
            return next(
              HttpError.format(
                {
                  message: `Request to ${projectUrl} returned a status of ${response.statusCode}`,
                  context: response.body
                },
                req
              )
            );
          }

          try {
            req.project = JSON.parse(body);
          } catch (e) {
            res.status(500);
            return next(
              HttpError.format(
                {
                  message:
                    "Project data received from the publish server was in an invalid format. Failed to run `JSON.parse`",
                  context: e.message,
                  stack: e.stack
                },
                req
              )
            );
          }

          next();
        }
      );
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
