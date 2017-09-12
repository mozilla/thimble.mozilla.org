"use strict";

let moment = require("moment");

module.exports = (config, req, res) => {
  let updated;
  let options;
  let params = req.query;
  let lang =
    req.localeInfo && req.localeInfo.lang ? req.localeInfo.lang : "en-US";

  // Get a localized "time ago" string, dealing with bogus date strings without crashing.
  moment.locale(lang);
  try {
    updated = moment(params.updated).fromNow();
  } catch (e) {
    updated = "";
  }

  options = {
    id: params.id,
    host: params.host,
    title: params.title,
    author: params.author,
    updated: updated,
    lang: lang
  };

  res.render("project-remix-bar.html", options);
};
