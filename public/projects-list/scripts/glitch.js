/* globals $: true */

var $ = require("jquery");

module.exports = {
  init: function() {
    let banner = $(".glitch-banner");
    let cta = $(".glitch-cta.underlay");
    if (banner && cta) {
      banner.removeClass("hidden");
    }
  }
};
