/**
 * GET for the index.html template
 */
exports.index = function(utils, env, nunjucksEnv, appName) {
  return function(req, res) {
    var content;

    if (req.pageData) {
      content = req.pageData.replace(/'/g, '\\\'').replace(/\n/g, '\\n').replace(/\//g,'\\\/');
    } else {
      var tpl = nunjucksEnv.getTemplate("friendlycode/templates/default-content.html");
      content = tpl.render({
        title: req.gettext("Your Awesome Webpage created on"),
        time: new Date(Date.now()).toUTCString(),
        text: req.gettext("Make something amazing with the web")
      });
    }

    if (req.body.pageOperation === "remix") {
      content = content.replace(/<title([^>]*)>/, "<title$1>Remix of ");
    }
    res.render('index.html', {
      appname: appName,
      appURL: env.get("HOSTNAME"),
      audience: env.get("AUDIENCE"),
      content: content,
      csrf: req.session._csrf,
      email: req.session.email || '',
      HTTP_STATIC_URL: '/',
      MAKE_ENDPOINT: env.get("MAKE_ENDPOINT"),
      pageOperation: req.body.pageOperation,
      origin: req.params.id,
      makeUrl: req.makeUrl,
      userbar: env.get("USERBAR")
    });
  };
};

exports.friendlycodeRoutes = function(app) {
  app.get( '/default-content', function( req, res ) {
    res.render('friendlycode/templates/default-content.html');
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
    res.render('friendlycode/templates/details-form.html');
  });

  app.get( '/slowparse/spec/errors.base.html', function( req, res ) {
    res.render('/slowparse/spec/errors.base.html');
  });

  app.get( '/slowparse/spec/errors.forbidjs.html', function( req, res ) {
    res.render('/slowparse/spec/errors.forbidjs.html');
  });
};
