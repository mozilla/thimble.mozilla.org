"use strict";

const HTML = [{
  id: "snippet-htmlComment",
  name: "Comment",
  title: "Add a Comment",
  data: '<!--  -->\n'
}, {
  id: "snippet-table",
  name: "Table",
  title: "Add a Table",
  data: '<table>\n' +
        '  <tr>\n' +
        '    <th></th>\n' +
        '    <th></th>\n' +
        '  </tr>\n' +
        '  <tr>\n' +
        '    <td></td>\n' +
        '    <td></td>\n' +
        '  </tr>\n' +
        '</table>\n'
}, {
  id: "snippet-definitionList",
  name: "Definition List",
  title: "Add a Definition List",
  data: '<dl>\n' +
        '  <dt></dt>\n' +
        '  <dd></dd>\n' +
        '  <dt></dt>\n' +
        '  <dd></dd>\n' +
        '</dl>\n'
}, {
  id: "snippet-orderedList",
  name: "Ordered List",
  title: "Add an Ordered List",
  data: '<ol>\n' +
        '  <li></li>\n' +
        '  <li></li>\n' +
        '  <li></li>\n' +
        '</ol>\n'
}, {
  id: "snippet-unorderedList",
  name: "Unordered List",
  title: "Add an Unordered List",
  data: '<ul>\n' +
        '  <li></li>\n' +
        '  <li></li>\n' +
        '  <li></li>\n' +
        '</ul>\n'
}, {
  id: "snippet-form",
  name: "Form",
  title: "Add a Form",
  data: '<form action="" method="get">\n' +
        '  <label for="first-name">First name:</label>\n' +
        '  <input id="first-name" type="text" name="firstname"><br>\n' +
        '  <label for="last-name">Last name:</label>\n' +
        '  <input id="last-name" type="text" name="lastname"><br>\n' +
        '  <input type="submit" value="Submit">\n' +
        '</form>\n'
}, {
  id: "snippet-script",
  name: "Javascript",
  title: "Add a Script",
  data: '<script src="URL"></script>\n'
}, {
  id: "snippet-style",
  name: "CSS Style",
  title: "Add Styling",
  data: '<style>\n' +
        '  h1 {color:red;}\n' +
        '  p {color:blue;}\n' +
        '</style>\n'
}, {
  id: "snippet-video",
  name: "Video",
  title: "Add Video",
  data: '<video width="320" height="240" controls>\n' +
        '  <source src="video.mp4" type="video/mp4">\n' +
        '  <source src="video.ogg" type="video/ogg">\n' +
        '  Your browser does not support the video tag.\n' +
        '</video>\n'
}, {
  id: "snippet-audio",
  name: "Audio",
  title: "Add Audio",
  data: '<audio controls>\n' +
        '  <source src="audio.ogg" type="audio/ogg">\n' +
        '  <source src="audio.mp3" type="audio/mpeg">\n' +
        '  Your browser does not support the audio tag.\n' +
        '</audio>\n'
}, {
  id: "snippet-mmt",
  name: "Mobile Meta",
  title: "Add Mobile Metadata",
  data: '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
}];

const CSS = [{
  id: "snippet-cssComment",
  name: "Comment",
  title: "Add a Comment",
  data: '/* ... */\n'
}, {
  id: "snippet-bodyTag",
  name: "Body",
  title: "Style the body element",
  data: 'body {\n' +
        '  background-color: lightblue;\n' +
        '}\n'
}, {
  id: "snippet-paragraphTag",
  name: "Paragraph",
  title: "Style a Paragraph",
  data: 'p {\n' +
        '  font-size: 20px;\n' +
        '}\n'
}, {
  id: "snippet-kfa",
  name: "Keyframe Animation",
  title: "Add a Keyframe Animation",
  data: '/* The animation code */\n' +
        '@keyframes identifier {\n' +
        '  from {background-color: red;}\n' +
        '  to {background-color: yellow;}\n' +
        '}\n\n' +
        '/* The element to apply the animation to */\n' +
        'div {\n' +
        '  animation-name: identifier;\n' +
        '  animation-duration: 4s;\n' +
        '}\n'
}, {
  id: "snippet-linkStyling",
  name: "Anchor Link",
  title: "Style an Anchor",
  data: '/* unvisited link */\n' +
        'a:link {\n' +
        '  color: red;\n' +
        '}\n' +
        '/* visited link */\n' +
        'a:visited {\n' +
        '  color: green;\n' +
        '}\n' +
        '/* mouse over link */\n' +
        'a:hover {\n' +
        '  color: hotpink;\n' +
        '}\n' +
        '/* selected link */\n' +
        'a:active {\n' +
        '  color: blue;\n' +
        '}\n'
}, {
  id: "snippet-classSelector",
  name: "Class Selector",
  title: "Style elements with a class",
  data: '.className {\n' +
        '  background-color: green;\n' +
        '}\n'
}, {
  id: "snippet-idSelector",
  name: "ID Selector",
  title: "Style an element by its ID",
  data: '#idName {\n' +
        '  background-color: green;\n' +
        '}\n'
}, {
  id: "snippet-mediaQueries",
  name: "Media Queries",
  title: "Add a Media Query",
  data: '@media screen and (min-width: 769px) {\n' +
        ' /* STYLES HERE */\n' +
        '}\n' +
        '@media screen and (min-device-width: 481px) and (max-device-width: 768px) {\n' +
        '  /* STYLES HERE */\n' +
        '}\n' +
        '@media only screen and (max-device-width: 480px) {\n' +
        '  /* STYLES HERE */\n' +
        '}\n'
}, {
  id: "snippet-ffd",
  name: "Fonts",
  title: "Declare a Font",
  data: '@font-face {\n' +
        '  font-family: myFirstFont;\n' +
        '  src: url(sansation_bold.woff);\n' +
        '  font-weight: bold;\n' +
        '}\n'
}, {
  id: "snippet-beforeSelector",
  name: "Before Pseudo-Element",
  title: "Create and style a Before Pseudo-Element",
  data: '::before {\n' +
        '  content: "«";\n' +
        '  color: blue;\n' +
        '}\n'
}, {
  id: "snippet-afterSelector",
  name: "After Pseudo-Element",
  title: "Create and style an After Pseudo-Element",
  data: '::after {\n' +
        '  content: "»";\n' +
        '  color: red;\n' +
        '}\n'
}];

const JS = [{
  id: "snippet-emptyFunction",
  name: "Empty Function",
  title: "Add an Empty Function",
  data: 'function functionName() {\n' +
        ' // instructions\n' +
        '}\n'
}, {
  id: "snippet-forLoop",
  name: "For Loop",
  title: "Add a For Loop",
  data: 'for (var i = 0; i < array.length; i++) {\n' +
        ' // do something in a loop\n' +
        '}\n'
}, {
    id: "snippet-whileLoop",
    name: "While Loop",
    title: "Add a While Loop",
    data: 'while (condition) {\n' +
          ' // do something in a loop\n' +
          '}\n'
}, {
  id: "snippet-switch",
  name: "Switch/Case",
  title: "Add a Switch/Case Conditional",
  data: 'switch(variableName) {\n' +
        '  case "match1":\n' +
        '    break;\n' +
        '  case "match2":\n' +
        '    break;\n' +
        '  default:\n' +
        '}\n'
}, {
  id: "snippet-ifElse",
  name: "If/Else",
  title: "Add an If/Else Conditional",
  data: 'if (condition1) {\n' +
        '   // instructions for condition 1\n' +
        '} else if (condition2) {\n' +
        '   // instructions for condition 2\n' +
        '} else {\n' +
        '   // fallback instructions\n' +
        '}\n'
}, {
  id: "snippet-jsComment",
  name: "Comment",
  title: "Add a Comment",
  data: '/* ... */\n'
}, {
  id: "snippet-array",
  name: "Array",
  title: "Create an Array",
  data: 'var arrayName = [item1, item2, ...];\n'
}, {
  id: "snippet-object",
  name: "Object",
  title: "Create an Object Literal",
  data: 'var objectName = {\n' +
        '  keyName1: value1,\n' +
        '  keyName2: value2\n' +
        '};\n'
}];

module.exports = {
  HTML,
  CSS,
  JS
};
