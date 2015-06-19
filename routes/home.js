var url = require("url");

module.exports = function(config) {
  return function(req, res) {
    var makedetails = "{}";
    var project = req.session.project && req.session.project.meta;
      console.log(req.session.project.isNew);
    if(project && req.session.redirectFromProjectSelection) {
      makedetails = encodeURIComponent(JSON.stringify({
        title: project.title,
        dateCreated: project.date_created,
        dateUpdated: project.date_updated,
        tags: project.tags,
        description: project.description,
        isNew: req.session.project.isNew
      }));
    }

    var options = {
      appname: config.appName,
      appURL: config.appURL,
      personaHost: config.personaHost,
      allowJS: config.allowJS,
      csrf: req.csrfToken(),
      LOGIN_URL: config.loginURL,
      email: req.session.user ? req.session.user.email : "",
      HTTP_STATIC_URL: "/",
      MAKE_ENDPOINT: config.makeEndpoint,
      pageOperation: req.body.pageOperation,
      previewLoader: config.previewLoader,
      origin: req.params.id,
      makeUrl: req.makeUrl,
      together: config.together,
      userbar: config.userbarEndpoint,
      webmaker: config.webmaker,
      makedetails: makedetails,
      editorHOST: config.editorHOST,
      OAUTH_CLIENT_ID: config.oauth.client_id,
      OAUTH_AUTHORIZATION_URL: config.oauth.authorization_url
    };

    // We add the localization code to the query params through a URL object
    // and set search prop to nothing forcing query to be used during url.format()
    var urlObj = url.parse(req.url, true);
    urlObj.search = "";
    urlObj.query.locale = req.localeInfo.lang;
    var thimbleUrl = url.format(urlObj);

    // We forward query string params down to the editor iframe so that
    // it's easy to do things like enableExtensions/disableExtensions
    options.editorURL = config.editorURL + "/index.html" + (url.parse(thimbleUrl).search || "");

    if (req.user) {
      options.username = req.user.username;
      options.avatar = req.user.avatar;
    }

    req.session.redirectFromProjectSelection = false;
    req.session.project.isNew = false;

    res.render("index.html", options);
  };
};
