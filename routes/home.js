var url = require("url");
var querystring = require("querystring");

module.exports = function(config) {
  return function(req, res) {
    var qs = querystring.stringify(req.query);
    if(qs !== "") {
      qs = "?" + qs;
    }
    var project = req.session.project && req.session.project.meta;
    var makedetails = encodeURIComponent(JSON.stringify({
      id: project.id,
      userID: req.session.publishUser && req.session.publishUser.id,
      title: project.title,
      dateCreated: project.date_created,
      dateUpdated: project.date_updated,
      tags: project.tags,
      description: project.description,
      publishUrl: project.publish_url
    }));

    var options = {
      appURL: config.appURL,
      csrf: req.csrfToken(),
      makedetails: makedetails,
      editorHOST: config.editorHOST,
      loginURL: config.appURL + "/login",
      logoutURL: config.logoutURL,
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

    res.render("index.html", options);
  };
};
