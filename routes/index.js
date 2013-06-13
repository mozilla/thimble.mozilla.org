/**
 * GET for the index.html template
 */
exports.index = function(utils, env, appName) {
  return function(req, res) {
    var content = utils.defaultPage(),
        contentType = "defaultContent";
    if(req.pageData) {
      content = req.pageData.replace(/'/g, '\\\'').replace(/\n/g, '\\n');
    } else if (req.pageToLoad) {
      contentType = "pageToLoad";
      content = req.pageToLoad;
    }
    res.render('index.html', {
      appname: appName,
      appURL: env.get("HOSTNAME"),
      audience: env.get("AUDIENCE"),
      content: content,
      contentType: contentType,
      csrf: req.session._csrf,
      email: req.session.email || '',
      HTTP_STATIC_URL: '/',
      MAKE_ENDPOINT: env.get("MAKE_ENDPOINT"),
      pageOperation: req.body.pageOperation,
      origin: req.params.id,
      tutorialUrl: req.tutorialUrl,
      userbar: env.get("USERBAR")
    });
  };
};
