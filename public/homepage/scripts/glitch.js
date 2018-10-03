/* globals $: true */

var $ = require("jquery");

module.exports = {
  init: function() {
    let banner = $(".glitch-banner");
    let cta = $(".glitch-cta.underlay");
    let navbar = $(".navbar-thimble");
    if (banner && banner.length && cta && cta.length) {
      var close = $(".glitch-cta .cta-close");
      close.click(() => {
        navbar.removeClass("navbar-fix");
        banner.removeClass("hidden");
        cta.addClass("hidden");
      });
      cta.removeClass("hidden");
    } else if (banner && banner.length) {
      banner.removeClass("hidden");
    }
  }
};
