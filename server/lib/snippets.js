"use strict";
/*
  A list of code snippets that can be added into the editor.
  Note - If the property below says [LOCALIZABLE], it's value should be a
         localization key name whose value is specified in the
         locales/en-US/messages.properties file
  Each snippet should be an object with the following key/value pairs:
    - `id` : a unique snippet identifier
    - `name` : [LOCALIZABLE] The name/title of the snippet which
    - `title` : [LOCALIZABLE] A description of the snippet that is set on
                the `title` attribute and shown on hover.
    - `data`  : An object containing the code to be added into the editor.
                It contains the following key/value pairs
                  - `value` - The code snippet that will be inserted into the
                              editor. If the code contains strings that
                              need to be translated, it must use localization
                              keys for those strings inside the actual code
                              snippet with `gettext`,
                              for e.g. `{{ gettext("localizationKey") }}`,
                              vs. using the strings directly. Also, if you do
                              use localization keys in the code, make sure you
                              set the property below to `true`.
                  - `l10n` - [optional] Set it to true if the `value`
                             property of this object contains localization
                             keys. Defaults to false.
*/

const html = [{
  id: "snippet-htmlComment",
  name: "snippetHTMLComment",
  title: "snippetHTMLCommentTitle",
  data: {
    value: '<!-- {{ gettext("snippetHTMLCommentData") }} -->\n',
    l10n: true
  }
}, {
  id: "snippet-table",
  name: "snippetHTMLTable",
  title: "snippetHTMLTableTitle",
  data: {
    value: '<table>\n' +
           '  <tr>\n' +
           '    <th></th>\n' +
           '    <th></th>\n' +
           '  </tr>\n' +
           '  <tr>\n' +
           '    <td></td>\n' +
           '    <td></td>\n' +
           '  </tr>\n' +
           '</table>\n'
  }
}, {
  id: "snippet-definitionList",
  name: "snippetHTMLDefinitionList",
  title: "snippetHTMLDefinitionListTitle",
  data: {
    value: '<dl>\n' +
           '  <dt></dt>\n' +
           '  <dd></dd>\n' +
           '  <dt></dt>\n' +
           '  <dd></dd>\n' +
           '</dl>\n'
  }
}, {
  id: "snippet-orderedList",
  name: "snippetHTMLOrderedList",
  title: "snippetHTMLOrderedListTitle",
  data: {
    value: '<ol>\n' +
           '  <li></li>\n' +
           '  <li></li>\n' +
           '  <li></li>\n' +
           '</ol>\n'
  }
}, {
  id: "snippet-unorderedList",
  name: "snippetHTMLUnorderedList",
  title: "snippetHTMLUnorderedListTitle",
  data: {
    value: '<ul>\n' +
           '  <li></li>\n' +
           '  <li></li>\n' +
           '  <li></li>\n' +
           '</ul>\n'
  }
}, {
  id: "snippet-form",
  name: "snippetHTMLForm",
  title: "snippetHTMLFormTitle",
  data: {
    value: '<form action="" method="get">\n' +
           '  <label for="first-name">{{ gettext("snippetHTMLFormFirstNameLabel") }}</label>\n' +
           '  <input id="first-name" type="text" name="firstname"><br>\n' +
           '  <label for="last-name">{{ gettext("snippetHTMLFormLastNameLabel") }}</label>\n' +
           '  <input id="last-name" type="text" name="lastname"><br>\n' +
           '  <input type="submit" value="{{ gettext("snippetHTMLFormSubmit") }}">\n' +
           '</form>\n',
    l10n: true
  }
}, {
  id: "snippet-script",
  name: "snippetHTMLScript",
  title: "snippetHTMLScriptTitle",
  data: {
    value: '<script src="script-1.js"></script>\n'
  }
}, {
  id: "snippet-internal-stylesheet",
  name: "snippetHTMLInternalStylesheet",
  title: "snippetHTMLInternalStylesheetTitle",
  data: {
    value: '<style>\n' +
           '  h1 {color:red;}\n' +
           '  p {color:blue;}\n' +
           '</style>\n'
  }
}, {
  id: "snippet-external-stylesheet",
  name: "snippetHTMLExternalStylesheet",
  title: "snippetHTMLExternalStylesheetTitle",
  data: {
    value: '<link href="style.css" rel="stylesheet">\n'
  }
}, {
  id: "snippet-video",
  name: "snippetHTMLVideo",
  title: "snippetHTMLVideoTitle",
  data: {
    value: '<video width="320" height="240" controls>\n' +
           '  <source src="video.mp4" type="video/mp4">\n' +
           '  <source src="video.ogg" type="video/ogg">\n' +
           '  {{ gettext("snippetHTMLVideoData") }}\n' +
           '</video>\n',
    l10n: true
  }
}, {
  id: "snippet-audio",
  name: "snippetHTMLAudio",
  title: "snippetHTMLAudioTitle",
  data: {
    value: '<audio controls>\n' +
           '  <source src="audio.ogg" type="audio/ogg">\n' +
           '  <source src="audio.mp3" type="audio/mpeg">\n' +
           '  {{ gettext("snippetHTMLAudioData") }}\n' +
           '</audio>\n',
    l10n: true
  }
}, {
  id: "snippet-mmt",
  name: "snippetHTMLMetaMobile",
  title: "snippetHTMLMetaMobileTitle",
  data: {
    value: '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
  }
}];

const css = [{
  id: "snippet-cssComment",
  name: "snippetCSSComment",
  title: "snippetCSSCommentTitle",
  data: {
    value: '/* {{ gettext("snippetCSSCommentData") }} */\n',
    l10n: true
  }
}, {
  id: "snippet-bodyTag",
  name: "snippetCSSBodyStyle",
  title: "snippetCSSBodyStyleTitle",
  data: {
    value: 'body {\n' +
           '  background-color: lightblue;\n' +
           '}\n'
  }
}, {
  id: "snippet-paragraphTag",
  name: "snippetCSSParagraphStyle",
  title: "snippetCSSParagraphStyleTitle",
  data: {
    value: 'p {\n' +
           '  font-size: 20px;\n' +
           '}\n'
  }
}, {
  id: "snippet-kfa",
  name: "snippetCSSKeyframe",
  title: "snippetCSSKeyframeTitle",
  data: {
    value: '/* {{ gettext("snippetCSSKeyframeAnimationComment") }} */\n' +
           '@keyframes identifier {\n' +
           '  from {background-color: red;}\n' +
           '  to {background-color: yellow;}\n' +
           '}\n\n' +
           '/* {{ gettext("snippetCSSKeyframeAnimationTargetComment") }} */\n' +
           'div {\n' +
           '  animation-name: identifier;\n' +
           '  animation-duration: 4s;\n' +
           '}\n',
    l10n: true
  }
}, {
  id: "snippet-linkStyling",
  name: "snippetCSSAnchorStyle",
  title: "snippetCSSAnchorStyleTitle",
  data: {
    value: '/* {{ gettext("snippetCSSAnchorStyleUnvisitedLinkComment") }} */\n' +
           'a:link {\n' +
           '  color: red;\n' +
           '}\n' +
           '/* {{ gettext("snippetCSSAnchorStyleVisitedLinkComment") }} */\n' +
           'a:visited {\n' +
           '  color: green;\n' +
           '}\n' +
           '/* {{ gettext("snippetCSSAnchorStyleMouseOverLinkComment") }} */\n' +
           'a:hover {\n' +
           '  color: hotpink;\n' +
           '}\n' +
           '/* {{ gettext("snippetCSSAnchorStyleSelectedLinkComment") }} */\n' +
           'a:active {\n' +
           '  color: blue;\n' +
           '}\n',
    l10n: true
  }
}, {
  id: "snippet-classSelector",
  name: "snippetCSSClassSelector",
  title: "snippetCSSClassSelectorTitle",
  data: {
    value: '.className {\n' +
           '  background-color: green;\n' +
           '}\n'
  }
}, {
  id: "snippet-idSelector",
  name: "snippetCSSIDSelector",
  title: "snippetCSSIDSelectorTitle",
  data: {
    value: '#idName {\n' +
           '  background-color: green;\n' +
           '}\n'
  }
}, {
  id: "snippet-mediaQueries",
  name: "snippetCSSMediaQuery",
  title: "snippetCSSMediaQueryTitle",
  data: {
    value: '@media screen and (min-width: 769px) {\n' +
           ' /* {{ gettext("snippetCSSMediaQueryData") }} */\n' +
           '}\n' +
           '@media screen and (min-device-width: 481px) and (max-device-width: 768px) {\n' +
           '  /* {{ gettext("snippetCSSMediaQueryData") }} */\n' +
           '}\n' +
           '@media only screen and (max-device-width: 480px) {\n' +
           '  /* {{ gettext("snippetCSSMediaQueryData") }} */\n' +
           '}\n',
    l10n: true
  }
}, {
  id: "snippet-ffd",
  name: "snippetCSSFont",
  title: "snippetCSSFontTitle",
  data: {
    value: '@font-face {\n' +
           '  font-family: myFirstFont;\n' +
           '  src: url(sansation_bold.woff);\n' +
           '  font-weight: bold;\n' +
           '}\n'
  }
}, {
  id: "snippet-beforeSelector",
  name: "snippetCSSBeforePseudo",
  title: "snippetCSSBeforePseudoTitle",
  data: {
    value: '::before {\n' +
           '  content: "«";\n' +
           '  color: blue;\n' +
           '}\n'
  }
}, {
  id: "snippet-afterSelector",
  name: "snippetCSSAfterPseudo",
  title: "snippetCSSAfterPseudoTitle",
  data: {
    value: '::after {\n' +
           '  content: "»";\n' +
           '  color: red;\n' +
           '}\n'
  }
}];

const js = [{
  id: "snippet-emptyFunction",
  name: "snippetJSFunction",
  title: "snippetJSFunctionTitle",
  data: {
    value: 'function functionName() {\n' +
           ' // {{ gettext("snippetJSFunctionData") }}\n' +
           '}\n',
    l10n: true
  }
}, {
  id: "snippet-forLoop",
  name: "snippetJSForLoop",
  title: "snippetJSForLoopTitle",
  data: {
    value: 'for (var i = 0; i < array.length; i++) {\n' +
           ' // {{ gettext("snippetJSLoopData") }}\n' +
           '}\n',
    l10n: true
  }
}, {
    id: "snippet-whileLoop",
    name: "snippetJSWhileLoop",
    title: "snippetJSWhileLoopTitle",
    data: {
      value: 'while (condition) {\n' +
             ' // {{ gettext("snippetJSLoopData") }}\n' +
             '}\n',
      l10n: true
    }
}, {
  id: "snippet-switch",
  name: "snippetJSSwitchCase",
  title: "snippetJSSwitchCaseTitle",
  data: {
    value: 'switch(variableName) {\n' +
           '  case "match1":\n' +
           '    // {{ gettext("snippetJSConditionalComment") }}\n' +
           '    break;\n' +
           '  case "match2":\n' +
           '    // {{ gettext("snippetJSConditionalComment") }}\n' +
           '    break;\n' +
           '  default:\n' +
           '    // {{ gettext("snippetJSConditionalDefaultComment") }}\n' +
           '}\n',
    l10n: true
  }
}, {
  id: "snippet-ifElse",
  name: "snippetJSIfElse",
  title: "snippetJSIfElseTitle",
  data: {
    value: 'if (condition1) {\n' +
           '   // {{ gettext("snippetJSConditionalComment") }}\n' +
           '} else if (condition2) {\n' +
           '   // {{ gettext("snippetJSConditionalComment") }}\n' +
           '} else {\n' +
           '   // {{ gettext("snippetJSConditionalDefaultComment") }}\n' +
           '}\n',
    l10n: true
  }
}, {
  id: "snippet-jsComment",
  name: "snippetJSComment",
  title: "snippetJSCommentTitle",
  data: {
    value: '/* {{ gettext("snippetJSCommentData") }} */\n',
    l10n: true
  }
}, {
  id: "snippet-array",
  name: "snippetJSArray",
  title: "snippetJSArrayTitle",
  data: {
    value: 'var arrayName = ["item1", "item2", ...];\n'
  }
}, {
  id: "snippet-object",
  name: "snippetJSObject",
  title: "snippetJSObjectTitle",
  data: {
    value: 'var objectName = {\n' +
           '  keyName1: "value1",\n' +
           '  keyName2: "value2"\n' +
           '};\n'
  }
}];

module.exports = {
  html,
  css,
  js
};
