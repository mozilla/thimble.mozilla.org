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
  var utils = require("./utils"),
      hood = require("hood"),
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
            "https://netdna.bootstrapcdn.com",
            "https://code.cdn.mozilla.net/"
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
     * Check whether the requesting user has been authenticated.
     */
    checkForAuth: function(req, res, next) {
      if (!req.session.user) {
        return res.redirect(301, "/");
      }
      next();
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

        try {
          req.project = JSON.parse(body);
        } catch(e) {
          console.error("Failed to parse project sent by the publish server in `setProject` middleware with ", e);
          next(utils.error(500));
          return;
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
    clearRedirects: function(req, res, next) {
      delete req.session.home;
      next();
    }
  };
};
