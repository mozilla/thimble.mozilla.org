defineTests([
  "jquery",
  "codemirror",
  "fc/ui/gutter-pointer"
], function($, CodeMirror, gutterPointer) {
  module("gutterPointer");

  test("does not smoke", function() {
    var div = $("<div></div>").appendTo("#qunit-fixture");
    var cm = CodeMirror(div[0], {
      value: "hello\nthere\ndude",
      lineNumbers: true
    });

    var mark = document.createElement("span");
    $(mark).attr("class","gutter-mark blarg");
    mark.innerHTML = "...";
    cm.setGutterMarker(0, "CodeMirror-linenumbers", mark);
    var gp = $(gutterPointer(cm, "blarg"));

    equal(gp.css('position'), "absolute",
          'gutterPointer is relatively positioned');
    equal(gp[0].nodeName, "svg", "gutterPointer is <svg>");
    equal(gp[0].namespaceURI, "http://www.w3.org/2000/svg",
          "gutterPointer has SVG namespace");
    equal(gp.attr("class"), "gutter-pointer blarg");
    div.remove();
  });
});
