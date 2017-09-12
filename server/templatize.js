"use strict";

let Nunjucks = require("nunjucks");

module.exports = function templatize(server, paths) {
  let nunjucksOptions = {
    noCache: true,
    watch: true,
    autoescape: true
  };

  let engine = new Nunjucks.Environment(
    paths.map(path => new Nunjucks.FileSystemLoader(path, nunjucksOptions))
  );

  engine.addFilter("instantiate", function(input) {
    return new Nunjucks.Template(input).render(this.getVariables());
  });

  engine.express(server);
};
