define(["text", "localized"], function(text, localized) {
  var buildMap = {};
  
  function htmlToI18nBundle(document, html) {
    var result = {};
    var div = document.createElement('div');

    div.innerHTML = html;
    [].slice.call(div.querySelectorAll('.error-msg')).forEach(function(el) {
      var name = el.className.split(' ').slice(-1)[0];
      result[name] = el.innerHTML;
    });
    return result;
  };

  return {
    load: function(name, req, onLoad, config) {
      name = name.replace( /^\//, "/" + localized.getCurrentLang() + "/" );
      var url = req.toUrl(name).replace(".js", ".html");
      
      text.get(url, function(html) {
        if (config.isBuild) {
          buildMap[name] = htmlToI18nBundle(config.makeDocument(), html);
          onLoad(buildMap[name]);
        } else {
          onLoad(htmlToI18nBundle(document, html));
        }
      });
    }
  };
});
