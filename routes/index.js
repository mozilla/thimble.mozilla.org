/**
 * GET for the index.html template
 */
var moment = require("moment");
var i18n = require("webmaker-i18n");
var langmap = i18n.getAllLocaleCodes();

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

module.exports = function(utils, env, nunjucksEnv, appName) {

  var allowJS = env.get("JAVASCRIPT_ENABLED", false),
      appURL = env.get("APP_HOSTNAME"),
      personaHost = env.get("PERSONA_HOST"),
      makeEndpoint = env.get("MAKE_ENDPOINT"),
      previewLoader = env.get("PREVIEW_LOADER"),
      together = env.get("USE_TOGETHERJS") ? env.get("TOGETHERJS") : false,
      userbarEndpoint = env.get("USERBAR"),
      webmaker = env.get("WEBMAKER_URL");

  var editorURL;

  if (env.get("NODE_ENV") === "development") {
    editorURL = '/friendlycode/vendor/brackets/src';
  } else {
    editorURL = '/friendlycode/vendor/brackets/dist';
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

      res.render('index.html', {
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
        editorURL: editorURL
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
        res.render('/slowparse/spec/errors.base.html');
      });

      app.get( '/slowparse/spec/errors.forbidjs.html', function( req, res ) {
        res.render('/slowparse/spec/errors.forbidjs.html');
      });
    }
  };
};
