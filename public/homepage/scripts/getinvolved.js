/* globals $: true */

var $ = require("jquery");

module.exports = {
  init: function() {
    this.issueCountEl = $(".good-bug-count");

    if (this.issueCountEl.length === 0) {
      return;
    }

    var URL =
      "https://api.github.com/repos/mozilla/thimble.mozilla.org/issues?labels=good%20first%20bug";

    var that = this;
    $.ajax({
      url: URL,
      complete: function(xhr) {
        that.updateCount(xhr.responseJSON);
      }
    });
  },
  updateCount: function(data) {
    var issueCount = data.length;

    if (issueCount > 1) {
      if (issueCount >= 30) {
        issueCount = "30+";
      }
      this.issueCountEl.text(issueCount);
      this.issueCountEl.show();
    }
  }
};
