module.exports = {
  slugify: function(s) {
    return s.toLowerCase().replace(/[^\w\s]+/g,'').replace(/\s+/g,'-');
  }
};
