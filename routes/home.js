var url = require("url");
var querystring = require("querystring");

module.exports = function(config) {
  return function(req, res) {
    var qs = querystring.stringify(req.query);
    if(qs !== "") {
      qs = "?" + qs;
    }
    var makedetails = "{}";
    var project = req.session.project && req.session.project.meta;

    if(project && req.session.redirectFromProjectSelection) {
      makedetails = encodeURIComponent(JSON.stringify({
        title: project.title,
        dateCreated: project.date_created,
        dateUpdated: project.date_updated,
        tags: project.tags,
        description: project.description,
        isNew: req.session.project.isNew
      }));
      req.session.project.isNew = false;
    }

    var options = {
      appname: config.appName,
      appURL: config.appURL,
      personaHost: config.personaHost,
      csrf: req.csrfToken(),
      LOGIN_URL: config.loginURL,
      email: req.session.user ? req.session.user.email : "",
      HTTP_STATIC_URL: "/",
      pageOperation: req.body.pageOperation,
      origin: req.params.id,
      together: config.together,
      userbar: config.userbarEndpoint,
      webmaker: config.webmaker,
      makedetails: makedetails,
      editorHOST: config.editorHOST,
      OAUTH_CLIENT_ID: config.oauth.client_id,
      OAUTH_AUTHORIZATION_URL: config.oauth.authorization_url,
      queryString: qs
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

    res.render("index.html", options);
  };
};
