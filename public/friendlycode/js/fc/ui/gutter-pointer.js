"use strict";

// gutterPointer(codeMirror, highlightClass)
//
// This function creates and returns an SVG shape that looks like this:
//
//   --\
//   |  \
//   |  /
//   --/
//
// It also puts the shape between the gutter and the content of a
// CodeMirror line. The shape will be vertically stretched to take up the
// entire height of the line.
//
// The shape is given the class gutter-pointer, as well as the same
// class as the highlightClass argument.
//
// Arguments:
//
//   codeMirror: The CodeMirror instance to apply the pointer to.
//
//   highlightClass: The class name used to "highlight" the desired
//     gutter line via CodeMirror.setMarker().
//
// This function makes some assumptions about the way CodeMirror works,
// as well as the styling applied to the CodeMirror instance, but we
// try where possible to use methods and CSS classes documented in
// the CodeMirror manual at http://codemirror.net/doc/manual.html.

define(["jquery"], function($) {
  var SVG_NS = "http://www.w3.org/2000/svg";

  function attrs(element, attributes) {
    for (var name in attributes)
      element.setAttribute(name, attributes[name].toString());
  }

  return function gutterPointer(codeMirror, highlightClass) {
    var wrapper = $(codeMirror.getWrapperElement()),
        svg = document.createElementNS(SVG_NS, "svg"),
        pointer = document.createElementNS(SVG_NS, "polygon"),
        w = $(".CodeMirror-gutters").width()/2,
        selector = ".gutter-mark."+highlightClass,
        collection = $(selector, wrapper),
        first = collection.first()[0],
        last = collection.last()[0],
        h = last.getBoundingClientRect().bottom - first.getBoundingClientRect().top;

    attrs(svg, {
      'class': "gutter-pointer " + highlightClass,
      viewBox: [0, 0, w, h].join(" ")
    });

    attrs(pointer, {
      points: [
        "0,0",
        (w/2) + ",0",
        w + "," + (h/2),
        (w/2) + "," + h,
        "0," + h
      ].join(" ")
    });

    svg.appendChild(pointer);
    $(svg).css({
      position: 'absolute',
      width: w + "px",
      height: h + "px",
      right: "-" + w + "px"
    });

    $(first).append(svg);

    return $(svg);
  };
});
