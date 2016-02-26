"use strict";

let multer = require("multer");
let request = require("request");
let querystring = require("querystring");
let uuid = require("uuid");
let cors = require("cors");
let Cryptr = require("cryptr");

let env = require("./environment");
let utils = require("./utils");

let upload = multer({
  dest: require("os").tmpdir(),
  limits: { fileSize: env.get("MAX_FILE_SIZE_BYTES") }
});
const publishHost = env.get("PUBLISH_HOSTNAME");

module.exports = function middlewareConstructor() {
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
     * Check whether the requesting user has been authenticated.
     */
    checkForAuth(req, res, next) {
      if(req.session.user) {
        return next();
      }

      let locale = (req.localeInfo && req.localeInfo.lang) ? req.localeInfo.lang : "en-US";
      res.redirect(301, `/${locale}`);
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
          properties.every(prop => req.body[prop] !== null && req.body[prop] !== undefined);

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
    setPublishUser(req, res, next) {
      let user = req.user;
      if(!user) {
        return next();
      }

      request({
        method: "POST",
        url: `${publishHost}/users/login`,
        headers: {
          "Authorization": `token ${user.token}`
        },
        body: {
          name: user.username
        },
        json: true
      }, (err, response, body) => {
        if(err) {
          return next(utils.error(500));
        }

        if(response.statusCode !== 200 &&  response.statusCode !== 201) {
          return next(utils.error(response.statusCode, response.body));
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

      // Get project data from publish.wm.org
      request.get({
        url: `${publishHost}/projects/${projectId}`,
        headers: {
          "Authorization": `token ${req.user.token}`
        }
      }, (err, response, body) => {
        if(err) {
          return next(utils.error(500));
        }

        if(response.statusCode !== 200) {
          return next(utils.error(response.statusCode, response.body));
        }

        try {
          req.project = JSON.parse(body);
        } catch(e) {
          console.error("Failed to parse project sent by the publish server in `setProject` middleware with ", e);
          return next(utils.error(500));
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
