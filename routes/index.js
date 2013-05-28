/**
 * GET for the index.html template
 */
exports.index = function(utils, env, appName) {
  return function(req, res) {
    var content = utils.defaultPage();
    if(req.pageData) {
      content = req.pageData.replace(/'/g, '\\\'').replace(/\n/g, '\\n');
    }
    res.render('index.html', {
      appname: appName,
      appURL: env.get("HOSTNAME"),
      audience: env.get("AUDIENCE"),
      email: req.session.email || '',
      HTTP_STATIC_URL: '/',
      MAKE_ENDPOINT: env.get("MAKE_ENDPOINT"),
      pageOperation: req.body.pageOperation,
      REMIXED_FROM: req.params.id,
      template: content,
      userbar: env.get("USERBAR")
    });
  };
};
