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
      oauth = env.get("OAUTH"),
      publishURL = env.get("PUBLISH_HOSTNAME");

  // We make sure to grab just the protocol and hostname for
  // postmessage security.
  var editorHOST = url.parse(env.get("BRAMBLE_URI"));
  editorHOST = editorHOST.protocol +"//"+ editorHOST.host + editorHOST.pathname;

  var editorURL;

  if (env.get("NODE_ENV") === "development") {
    editorURL = env.get("BRAMBLE_URI") + '/src';
  } else {
    editorURL = env.get("BRAMBLE_URI") + '/dist';
  }

  function renderUsersProjects(req, res) {
    var user = req.session.user;
    var username = encodeURIComponent(user.username);
    request.get({
      url: publishURL + '/users?name=' + username,
      headers: {
        "Authorization": "token " + cryptr.decrypt(req.session.token)
      }
    }, function(err, response, body) {
      if(err) {
        console.error('Error sending request', err);
        // deal with error
        return;
      }

      if(response.statusCode !== 200) {
        console.error('Error retrieving user: ', response);
        // deal with failure
        return;
      }

      var publishUser = req.session.publishUser = JSON.parse(body);

      request.get({
        url: publishURL + '/users/' + publishUser.id + '/projects',
        headers: {
          "Authorization": "token " + cryptr.decrypt(req.session.token)
        }
      }, function(err, response, body) {
        if(err) {
          console.error('Error sending request', err);
          // deal with error
          return;
        }

        if(response.statusCode !== 200) {
          console.error('Error retrieving user\'s projects: ', response);
          // deal with failure
          return;
        }

        var options = {
          csrf: req.csrfToken ? req.csrfToken() : null,
          HTTP_STATIC_URL: '/',
          projects: JSON.parse(body),
          PROJECT_URL: 'project'
        };

        res.render('projects.html', options);
      });
    });
  }

  function showThimble(req, res) {
    var makedetails = '{}';
    var project = req.session.project && req.session.project.meta;
    if(project && req.session.redirectFromProjectSelection) {
      makedetails = encodeURIComponent(JSON.stringify({
        title: project.title,
        dateCreated: project.date_created,
        dateUpdated: project.date_updated,
        tags: project.tags,
        description: project.description
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

    req.session.redirectFromProjectSelection = false;

    res.render('index.html', options);
  }

  function index(req, res) {
    // TODO: login stuff
    // Hack until login button is set up
    if(req.query.loggedIn === "yes") {
      req.session.user = { username: "ag_dubs" };
      req.session.token = cryptr.encrypt("fake_token");
    }
    if(req.session.user && !req.session.redirectFromProjectSelection) {
      renderUsersProjects(req, res);
      return;
    }

    showThimble(req, res);
  }

  return {
    index: index,
    showThimble: showThimble,

    openProject: function(req, res) {
      if(!req.session.user) {
        res.redirect(301, '/');
        return;
      }

      var projectId = req.params.projectId;
      if(!projectId) {
        // TODO: handle error
        console.error('No project ID specified');
        return;
      }

      // TODO: UI implementation (progress bar/spinner etc.)
      //       for blocking code
      // Get project data from publish.wm.org
      request.get({
        url: publishURL + '/projects/' + projectId,
        headers: {
          "Authorization": "token " + cryptr.decrypt(req.session.token)
        }
      }, function(err, response, body) {
        if(err) {
          // TODO: handle error
          console.error('Failed to get project info');
          return;
        }

        if(response.statusCode !== 200) {
          // TODO: handle error
          console.error('Error retrieving user\'s projects: ', response);
          return;
        }

        req.session.project = {};
        req.session.project.meta = JSON.parse(body);
        req.session.redirectFromProjectSelection = true;

        res.redirect(301, '/');
      });
    },

    newProject: function(req, res) {
      if(!req.session.user) {
        res.redirect(301, '/');
        return;
      }


    },

    getProject: function(req, res) {
      if(!req.session.user) {
        res.send(403);
        return;
      }

      var projectId = req.session.project.meta.id;

      request.get({
        url: publishURL + '/projects/' + projectId + '/files',
        headers: {
          'Authorization': 'token ' + cryptr.decrypt(req.session.token)
        }
      }, function(err, response, body) {
        if(err) {
          // TODO: handle error
          console.error('Failed to execute request for project files');
          res.send(500);
          return;
        }

        if(response.statusCode !== 200) {
          // TODO: handle error
          console.error('Error retrieving user\'s project files: ', response);
          res.send(404);
          return;
        }

        var files = JSON.parse(body);
        req.session.project.files = files.map(function(file) {
          var fileMeta = JSON.parse(JSON.stringify(file));
          delete fileMeta.buffer;
          return fileMeta;
        });

        res.type('application/json');
        res.send({
          project: req.session.project.meta,
          files: files
        });
      });
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
        res.render('slowparse/spec/errors.base.html');
      });

      app.get( '/slowparse/spec/errors.forbidjs.html', function( req, res ) {
        res.render('slowparse/spec/errors.forbidjs.html');
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
