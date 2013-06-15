module.exports = {
  defaultPage: function() {
    return "<!doctype html>\\n" +
           "<html>\\n" +
           "  <style>\\n" +
           "    body { margin: 0; padding: 0; padding-top: 37px; }\\n" +
           "  </style>\\n" +
           "  <head>\\n" +
           "    <title>Your Awesome Webpage created on " + new Date(Date.now()).toUTCString() + "</title>\\n" +
           "  </head>\\n" +
           "  <body>\\n" +
           "    <p>Make something amazing with the web</p>\\n" +
           "  </body>\\n" +
           "</html>\\n";
  },
  slugify: function(s) {
    return s.toLowerCase().replace(/[^\w\s]+/g,'').replace(/\s+/g,'-');
  }
};
