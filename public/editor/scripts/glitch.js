/* globals $: true */

var $ = require("jquery");

module.exports = {
  init: function() {
    let banner = $(".glitch-banner");
    let cta = $(".glitch-cta.underlay");

    if (banner && cta) {
        let btn = $(".cta-close", cta);
        btn.click(() => {
            cta.addClass("hidden");
        });

        btn = $(".export-button", cta);
        btn.click(() => {

        });

        btn = $(".export-button", banner);
        btn.click(() => cta.removeClass("hidden"));
        banner.removeClass("hidden");
    }
  }
};
