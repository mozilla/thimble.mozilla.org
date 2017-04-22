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
                  - `value` - [LOCALIZABLE] If the code contains strings that
                              need to be translated, it must be a localization
                              key. Otherwise, it is a string containing the
                              code that will be inserted into the editor.
                  - `l10n` - [optional] Set it to true if the `value`
                             property of this object is a localization key.
                             Defaults to false.
*/

const HTML = [{
  id: "snippet-htmlComment",
  name: "snippetHTMLComment",
  title: "snippetHTMLCommentTitle",
  data: {
    value: "snippetHTMLCommentData",
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
    value: "snippetHTMLFormData",
    l10n: true
  }
}, {
  id: "snippet-script",
  name: "snippetHTMLScript",
  title: "snippetHTMLScriptTitle",
  data: {
    value: "snippetHTMLScriptData",
    l10n: true
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
    value: "snippetHTMLExternalStylesheetData",
    l10n: true
  }
}, {
  id: "snippet-video",
  name: "snippetHTMLVideo",
  title: "snippetHTMLVideoTitle",
  data: {
    value: "snippetHTMLVideoData",
    l10n: true
  }
}, {
  id: "snippet-audio",
  name: "snippetHTMLAudio",
  title: "snippetHTMLAudioTitle",
  data: {
    value: "snippetHTMLAudioData",
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

const CSS = [{
  id: "snippet-cssComment",
  name: "snippetCSSComment",
  title: "snippetCSSCommentTitle",
  data: {
    value: "snippetCSSCommentData",
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
    value: "snippetCSSKeyframeData",
    l10n: true
  }
}, {
  id: "snippet-linkStyling",
  name: "snippetCSSAnchorStyle",
  title: "snippetCSSAnchorStyleTitle",
  data: {
    value: "snippetCSSAnchorStyleData",
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
    value: "snippetCSSMediaQueryData",
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

const JS = [{
  id: "snippet-emptyFunction",
  name: "snippetJSFunction",
  title: "snippetJSFunctionTitle",
  data: {
    value: "snippetJSFunctionData",
    l10n: true
  }
}, {
  id: "snippet-forLoop",
  name: "snippetJSForLoop",
  title: "snippetJSForLoopTitle",
  data: {
    value: "snippetJSForLoopData",
    l10n: true
  }
}, {
    id: "snippet-whileLoop",
    name: "snippetJSWhileLoop",
    title: "snippetJSWhileLoopTitle",
    data: {
      value: "snippetJSWhileLoopData",
      l10n: true
    }
}, {
  id: "snippet-switch",
  name: "snippetJSSwitchCase",
  title: "snippetJSSwitchCaseTitle",
  data: {
    value: "snippetJSSwitchCaseData",
    l10n: true
  }
}, {
  id: "snippet-ifElse",
  name: "snippetJSIfElse",
  title: "snippetJSIfElseTitle",
  data: {
    value: "snippetJSIfElseData",
    l10n: true
  }
}, {
  id: "snippet-jsComment",
  name: "snippetJSComment",
  title: "snippetJSCommentTitle",
  data: {
    value: "snippetJSCommentData",
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
  HTML,
  CSS,
  JS
};
