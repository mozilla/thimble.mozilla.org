// This is a simple RequireJS plugin that loads an underscore.js template.
define([
  "text",
  "underscore",
  "localized"
], function (text, _, localized) {

  function templatePath(require, name) {
    return "/" + localized.getCurrentLang()  + "/" + name.replace(".js", ".html");
  }

  return {
    load: function(name, req, onLoad, config) {
      text.get(templatePath(req, name), function (data) {
        if (config.isBuild) {
          return onLoad();
        }
        onLoad(_.template(data));
      });
    }
  };
});