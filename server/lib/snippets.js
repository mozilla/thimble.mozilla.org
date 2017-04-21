"use strict";

class Snippets {
    static getSnippets() {
        const snippets = {
            "HTML": [{
                    name: "Comment",
                    title: "Add a Comment",
                    id: "snippet-htmlComment",
                    data: "<!--  -->\n"
                },
                {
                    name: "Table",
                    title: "Add a Table",
                    id: "snippet-table",
                    data: '<table> \n' +
                        '  <tr> \n' +
                        '    <th></th> \n' +
                        '    <th></th> \n' +
                        '  </tr> \n' +
                        '  <tr> \n' +
                        '    <td></td> \n' +
                        '    <td></td> \n' +
                        '  </tr> \n' +
                        '</table>\n'
                },
                {
                    name: "Definition List",
                    title: "Add a Definition List",
                    id: "snippet-definitionList",
                    data: '<dl> \n' +
                        '  <dt></dt> \n' +
                        '    <dd></dd> \n' +
                        '  <dt></dt> \n' +
                        '    <dd></dd> \n' +
                        '</dl>\n'
                },
                {
                    name: "Ordered List",
                    title: "Add a Ordered List",
                    id: "snippet-orderedList",
                    data: '<ol> \n' +
                        '  <li></li> \n' +
                        '  <li></li> \n' +
                        '  <li></li> \n' +
                        '</ol>\n'
                },
                {
                    name: "Unordered List",
                    title: "Add a Unordered List",
                    id: "snippet-unorderedList",
                    data: '<ul> \n' +
                        '  <li></li> \n' +
                        '  <li></li> \n' +
                        '  <li></li> \n' +
                        '</ul>\n'
                },
                {
                    name: "Form",
                    title: "Add a Form",
                    id: "snippet-form",
                    data: '<form action="/action_page.php"> \n' +
                        '  First name:<br> \n' +
                        '  <input type="text" name="firstname" value="Value1"><br> \n' +
                        '  Last name:<br> \n' +
                        '  <input type="text" name="lastname" value="Value2"> \n' +
                        '  <br><br> \n' +
                        '  <input type="submit" value="Submit"> \n' +
                        '</form>\n'
                },
                {
                    name: "Js Script",
                    title: "Add a Script",
                    id: "snippet-script",
                    data: '<script src="URL"> \n'
                },
                {
                    name: "CSS Style",
                    title: "Add Styling",
                    id: "snippet-style",
                    data: '<style> \n' +
                        '  h1 {color:red;} \n' +
                        '  p {color:blue;} \n' +
                        '</style>\n'
                },
                {
                    name: "Video",
                    title: "Add a Video",
                    id: "snippet-video",
                    data: '<video width="320" height="240" controls> \n' +
                        '  <source src="video.mp4" type="video/mp4"> \n' +
                        '  <source src="video.ogg" type="video/ogg"> \n' +
                        '  Your browser does not support the video tag. \n' +
                        '</video>\n'
                },
                {
                    name: "Audio",
                    title: "Add a Audio",
                    id: "snippet-audio",
                    data: '<audio controls> \n' +
                        '  <source src="audio.ogg" type="audio/ogg"> \n' +
                        '  <source src="audio.mp3" type="audio/mpeg"> \n' +
                        '  Your browser does not support the audio tag. \n' +
                        '</audio>\n'
                },
                {
                    name: "Mobile Meta",
                    title: "Add a Mobile Meta",
                    id: "snippet-mmt",
                    data: '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
                }
            ],
            "CSS": [{
                    name: "Body",
                    title: "Add a Body",
                    id: "snippet-bodyTag",
                    data: 'body {\n' +
                        '  background-color: lightblue;\n' +
                        '}\n'
                },
                {
                    name: "Paragraph",
                    title: "Add a Paragraph",
                    id: "snippet-paragraphTag",
                    data: 'p {\n' +
                        '  font-size: 20px;\n' +
                        '}\n'
                },
                {
                    name: "Key Frame Animation",
                    title: "Add a Key Frame Animation",
                    id: "snippet-kfa",
                    data: '/* The animation code */ \n' +
                        '@keyframes example {\n' +
                        '  from {background-color: red;}\n' +
                        '  to {background-color: yellow;}\n' +
                        '}\n\n' +
                        '/* The element to apply the animation to */ \n' +
                        'div {\n' +
                        '  animation-name: example;\n' +
                        '  animation-duration: 4s;\n' +
                        '}\n'
                },
                {
                    name: "Link Syling",
                    title: "Add Link Styling",
                    id: "snippet-linkStyling",
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
                },
                {
                    name: "Class Selector",
                    title: "Add a Class Selector",
                    id: "snippet-classSelector",
                    data: '.class { \n' +
                        '  css declarations; \n' +
                        '}\n'
                },
                {
                    name: "ID Selector",
                    title: "Add a ID Selector",
                    id: "snippet-idSelector",
                    data: '#id { \n' +
                        '  css declarations; \n' +
                        '}\n'
                },
                {
                    name: "Media Queries",
                    title: "Add Media Queries",
                    id: "snippet-mediaQueries",
                    data: '@media screen and (min-width: 769px) { \n' +
                        ' /* STYLES HERE */ \n' +
                        '} \n' +
                        '@media screen and (min-device-width: 481px) and (max-device-width: 768px) { \n' +
                        '  /* STYLES HERE */ \n' +
                        '} \n' +
                        '@media only screen and (max-device-width: 480px) { \n' +
                        '  /* STYLES HERE */ \n' +
                        '} \n'
                },
                {
                    name: "Font Face Declaration",
                    title: "Add a Font Face Declaration",
                    id: "snippet-ffd",
                    data: '@font-face { \n' +
                        '  font-family: myFirstFont; \n' +
                        '  src: url(sansation_bold.woff); \n' +
                        '  font-weight: bold; \n' +
                        '}\n'
                },
                {
                    name: "Before Selector",
                    title: "Add a Before Selector",
                    id: "snippet-beforeSelector",
                    data: '::before \n'
                },
                {
                    name: "After Selector",
                    title: "Add a After Selector",
                    id: "snippet-afterSelector",
                    data: '::after \n'
                }
            ],
            "JS": [{
                    name: "Empty Function",
                    title: "Add a Empty Function",
                    id: "snippet-emptyFunction",
                    data: 'function functionName() {\n' +
                        '  \n' +
                        '}\n'
                },
                {
                    name: "For Loop",
                    title: "Add a For Loop",
                    id: "snippet-forLoop",
                    data: 'for (i = 0; i < array.length; i++) { \n' +
                        '  \n' +
                        '}\n'
                },
                {
                    name: "While Loop",
                    title: "Add a While Loop",
                    id: "snippet-whileLoop",
                    data: 'while (true) { \n' +
                        '  \n' +
                        '}\n'
                },
                {
                    name: "Switch",
                    title: "Add a For Switch",
                    id: "snippet-switch",
                    data: 'switch(n) { \n' +
                        '  case n:  \n' +
                        '    break;  \n' +
                        '  case n:  \n' +
                        '    break;  \n' +
                        '  default:  \n' +
                        '}\n'
                },
                {
                    name: "If/Else",
                    title: "Add a For If/Else",
                    id: "snippet-ifElse",
                    data: 'if (condition1) { { \n' +
                        '    \n' +
                        '} else if (condition2) {  \n' +
                        '    \n' +
                        '} else {  \n' +
                        '    \n' +
                        '}\n'
                },
                {
                    name: "Comment",
                    title: "Add a For Comment",
                    id: "snippet-jsComment",
                    data: '/* ... */ { \n'
                },
                {
                    name: "Array",
                    title: "Add an Array",
                    id: "snippet-array",
                    data: 'var array_name = [item1, item2, ...]; \n'
                },
                {
                    name: "Object",
                    title: "Add an Object",
                    id: "snippet-object",
                    data: 'var object_name = {key1:value1, key2:value2, ...}; \n'
                }
            ]
        };

        return snippets;
    }
}

module.exports = Snippets;