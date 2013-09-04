"use strict";

defineTests([
  "jquery",
  "fc/ui/mark-tracker",
  "codemirror"
], function($, MarkTracker, CodeMirror) {
  module("MarkTracker");

  var className = "cm-debug";

  function mtTest(name, cb) {
    test(name, function() {
      var place = $("<div></div>");
      place.appendTo(document.body);
      var cm = CodeMirror(place[0]);
      var mt = MarkTracker(cm);
      try {
        cb(place, cm, mt);
      } finally {
        place.remove();
      }
    });
  }

  mtTest("codeMirror content mark/clear works", function(place, cm, mt) {
    cm.setValue("hello");
    mt.mark(2, 4, className);
    var fragment = $(".CodeMirror-measure ."+className).text();
    equal(fragment, "ll", "source code is marked w/ class");
    mt.clear();
    fragment = $(".CodeMirror-measure ."+className).text();
    equal(fragment, "", "source code class is cleared");
  });

  mtTest("related element mark/clear works", function(place, cm, mt) {
    var thing = $("<div></div>");
    cm.setValue("hello");
    mt.mark(1, 4, className, thing[0]);
    ok(thing.hasClass(className), "related element is marked w/ class");
    mt.clear();
    ok(!thing.hasClass(className), "related element class is cleared");
  });
});
