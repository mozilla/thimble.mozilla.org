/* globals $: true */

var $ = require("jquery");

module.exports = {
  init: function() {
    let cta = $(".glitch-cta.underlay");
    if (cta) {
      setTimeout(() => cta.removeClass("hidden"), 2000);
      var close = $(".glitch-cta .cta-close");
      close.click(() => cta.addClass("hidden"));
    }
  }
};
