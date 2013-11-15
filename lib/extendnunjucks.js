module.exports = {
  extend: function(nunjucksEnv, nunjucks) {
    nunjucksEnv.addFilter("instantiate", function(input) {
      var template = new nunjucks.Template(input);
      return template.render(this.getVariables());
    });
  }
};
