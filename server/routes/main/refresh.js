var querystring = require("querystring");

module.exports = function(config, req, res) {
  var locale = (req.localeInfo && req.localeInfo.lang) ? req.localeInfo.lang : "en-US";
  var qs = querystring.stringify(req.query);
  if(qs !== "") {
    qs = "?" + qs;
  }

  var options = {
    URL_PATHNAME: "/" + qs,
    languages: req.app.locals.languages,
    pageName: "refresh-editor"
  };

  res.render("refresh.html", options);
};
