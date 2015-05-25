/**
 * GET for the index.html template
 */
var moment = require("moment");
var i18n = require("webmaker-i18n");
var langmap = i18n.getAllLocaleCodes();
var url = require("url");
var env = require('../lib/environment');
var Cryptr = require("cryptr");
var request = require("request");

var cryptr = new Cryptr(env.get("SESSION_SECRET"));

// Content-fetching function used for generating the output
// on http://[...]/data routes via the index.rawData function.
function getPageData(req) {
  var content = "";
  if (req.pageData) {
    content = req.pageData;
    if (req.query.mode && req.query.mode === "remix") {
      content = content.replace(/<title([^>]*)>/, "<title$1>Remix of ");
    }
  }
  return content;
}

module.exports = function(utils, nunjucksEnv, appName) {
  var allowJS = env.get("JAVASCRIPT_ENABLED", false),
      appURL = env.get("APP_HOSTNAME"),
      personaHost = env.get("PERSONA_HOST"),
      makeEndpoint = env.get("MAKE_ENDPOINT"),
      previewLoader = env.get("PREVIEW_LOADER"),
      together = env.get("USE_TOGETHERJS") ? env.get("TOGETHERJS") : false,
      userbarEndpoint = env.get("USERBAR"),
      webmaker = env.get("WEBMAKER_URL"),
      oauth = env.get("OAUTH");

  // We make sure to grab just the protocol and hostname for
  // postmessage security.
  var editorHOST = url.parse(env.get("BRAMBLE_URI"));
  editorHOST = editorHOST.protocol +"//"+ editorHOST.host;

  var editorURL;

  if (env.get("NODE_ENV") === "development") {
    editorURL = env.get("BRAMBLE_URI") + '/src';
  } else {
    editorURL = env.get("BRAMBLE_URI") + '/dist';
  }

  return {
    index: function(req, res) {
      if (req.requestId) {
        res.locals.pageToLoad = appURL + "/" + req.localeInfo.lang + "/project/" + req.requestId + "/data";
      } else if (req.oldid) {
        res.locals.pageToLoad = appURL + "/p/" + req.oldid;
      }

      var makedetails = '{}';
      if(req.make) {
        makedetails = encodeURIComponent(JSON.stringify({
          title: req.make.title,
          tags: req.make.tags,
          locales: req.make.locale,
          description: req.make.description,
          published: req.make.published
        }));
      }

      var options = {
        appname: appName,
        appURL: appURL,
        personaHost: personaHost,
        allowJS: allowJS,
        csrf: req.csrfToken(),
        LOGIN_URL: env.get("LOGIN_URL"),
        email: req.session.user ? req.session.user.email : '',
        HTTP_STATIC_URL: '/',
        MAKE_ENDPOINT: makeEndpoint,
        pageOperation: req.body.pageOperation,
        previewLoader: previewLoader,
        origin: req.params.id,
        makeUrl: req.makeUrl,
        together: together,
        userbar: userbarEndpoint,
        webmaker: webmaker,
        makedetails: makedetails,
        editorHOST: editorHOST,
        OAUTH_CLIENT_ID: oauth.client_id,
        OAUTH_AUTHORIZATION_URL: oauth.authorization_url
      };

      // We add the localization code to the query params through a URL object
      // and set search prop to nothing forcing query to be used during url.format()
      var urlObj = url.parse(req.url, true);
      urlObj.search = "";
      urlObj.query["locale"] = req.localeInfo.lang;
      var thimbleUrl = url.format(urlObj);

      // We forward query string params down to the editor iframe so that
      // it's easy to do things like enableExtensions/disableExtensions
      options.editorURL = editorURL + '/index.html' + (url.parse(thimbleUrl).search || '');

      if (req.user) {
        options.username = req.user.username;
        options.avatar = req.user.avatar;
      }

      res.render('index.html', options);
    },

    rawData: function(req, res) {
      res.type('text/plain; charset=utf-8');
      res.send(getPageData(req));
    },

    friendlycodeRoutes: function(app) {
      app.get( '/default-content', function( req, res ) {
        moment.lang(req.localeInfo.momentLang);
        res.type('text/plain; charset=utf-8');
        res.render('friendlycode/templates/default-content.html', {
          title: req.gettext("Your Awesome Webpage created on"),
          time: moment().format('llll'),
          text: req.gettext("Make something amazing with the web")
        });
      });

      app.get( '/error-dialog', function( req, res ) {
        res.render('friendlycode/templates/error-dialog.html');
      });

      app.get( '/confirm-dialog', function( req, res ) {
        res.render('friendlycode/templates/confirm-dialog.html');
      });

      app.get( '/publish-dialog', function( req, res ) {
        res.render('friendlycode/templates/publish-dialog.html');
      });

      app.get( '/help-msg', function( req, res ) {
        res.render('friendlycode/templates/help-msg.html');
      });

      app.get( '/error-msg', function( req, res ) {
        res.render('friendlycode/templates/error-msg.html');
      });

      app.get( '/nav-options', function( req, res ) {
        res.render('friendlycode/templates/nav-options.html');
      });

      app.get( '/details-form', function( req, res ) {
        res.render('friendlycode/templates/details-form.html', {
          locales: Object.keys(langmap),
          langmap: langmap
        });
      });

      app.get( '/slowparse/spec/errors.base.html', function( req, res ) {
        res.render('/slowparse/spec/errors.base.html');
      });

      app.get( '/slowparse/spec/errors.forbidjs.html', function( req, res ) {
        res.render('/slowparse/spec/errors.forbidjs.html');
      });
    },

    oauth2Callback: function(req, res, next) {
      if (req.query.logout) {
        req.session = null;
        return res.redirect(301, '/');
      }

      if (!req.query.code) {
        return next({ status: 401, message: "OAUTH: Code required" });
      }

      if (!req.cookies.state || !req.query.state) {
        return next({ status: 401, message: "OAUTH: State required" });
      }

      if (req.cookies.state !== req.query.state) {
        return next({ status: 401, message: "OAUTH: Invalid state" });
      }

      if (req.query.client_id !== oauth.client_id) {
        return next({ status: 401, message: "OAUTH: Invalid client credentials" });
      }

      // First, fetch the token
      request.post({
        url: oauth.authorization_url + '/login/oauth/access_token',
        form: {
          client_id: oauth.client_id,
          client_secret: oauth.client_secret,
          grant_type: "authorization_code",
          code: req.query.code
        }
      }, function(err, response, body) {
        if (err) {
          console.log("Request error: ", err, " Body: ", body);
          return next({ status: 500, message: "Internal server error. See logs for details" });
        }

        if (response.statusCode !== 200) {
          console.log("Code " + response.statusCode + ". Error getting access token: ", body);
          return next({ status: response.statusCode, message: body });
        }

        try {
          body = JSON.parse(body);
        } catch(e) {
          return next({status: 500, err: e});
        }

        req.session.token = cryptr.encrypt(body.access_token);

        // Next, fetch user data
        request.get({
          url: oauth.authorization_url + "/user",
          headers: {
            "Authorization": "token " + body.access_token
          }
        }, function(err, response, body) {
          if (err) {
            console.log("Request error: ", err, " Body: ", body);
            return next({ status: 500, message: "Internal server error. See logs for details" });
          }

          if (response.statusCode !== 200) {
            console.log("Code " + response.statusCode + ". Error getting user data: ", body);
            return next({ status: response.statusCode, message: body });
          }

          try {
            req.session.user = JSON.parse(body);
          } catch(e) {
            return next({status: 500, err: e});
          }
          res.redirect(301, '/');
        });
      });
    }
  };
};
