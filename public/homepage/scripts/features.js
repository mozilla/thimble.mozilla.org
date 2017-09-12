/* globals $: true */

var $ = require("jquery");

module.exports = {
  init: function() {
    this.featureEls = $(".video-wrapper");
    var that = this;

    if ("ontouchstart" in document) {
      this.featureEls.bind("touchstart", function(event) {
        that.startVideo(event.currentTarget);
      });
    }

    this.featureEls.mouseenter(function() {
      that.startVideo($(this).get(0));
    });
  },
  startVideo: function(videoEl) {
    $(".video-wrapper:not(.paused)")
      .addClass("paused")
      .find("video")
      .get(0)
      .pause();
    $(videoEl)
      .removeClass("paused")
      .find("video")
      .get(0)
      .play();
  }
};
