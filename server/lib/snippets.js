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

const html = [
  {
    id: "snippet-htmlComment",
    name: "snippetHTMLComment",
    title: "snippetHTMLCommentTitle",
    data: {
      value: `<!-- {{ gettext("snippetCommentData") }} -->`,
      l10n: true
    }
  },
  {
    id: "snippet-table",
    name: "snippetHTMLTable",
    title: "snippetHTMLTableTitle",
    data: {
      value: `<table>
  <tr>
    <th>{{ gettext("snippetHTMLTableHeading") }}</th>
    <th>{{ gettext("snippetHTMLTableHeading") }}</th>
  </tr>
  <tr>
    <td>{{ gettext("snippetHTMLTableValue") }}</td>
    <td>{{ gettext("snippetHTMLTableValue") }}</td>
  </tr>
</table>
`,
      l10n: true
    }
  },
  {
    id: "snippet-orderedList",
    name: "snippetHTMLOrderedList",
    title: "snippetHTMLOrderedListTitle",
    data: {
      value: `<ol>
  <li>{{ gettext("snippetHTMLItem1") }}</li>
  <li>{{ gettext("snippetHTMLItem2") }}</li>
  <li>{{ gettext("snippetHTMLItem3") }}</li>
</ol>
`,
      l10n: true
    }
  },
  {
    id: "snippet-unorderedList",
    name: "snippetHTMLUnorderedList",
    title: "snippetHTMLUnorderedListTitle",
    data: {
      value: `<ul>
  <li>{{ gettext("snippetHTMLItem1") }}</li>
  <li>{{ gettext("snippetHTMLItem2") }}</li>
  <li>{{ gettext("snippetHTMLItem3") }}</li>
</ul>
`,
      l10n: true
    }
  },
  {
    id: "snippet-form",
    name: "snippetHTMLForm",
    title: "snippetHTMLFormTitle",
    data: {
      value: `<form action="" method="get">
  <label for="first-name">{{ gettext("snippetHTMLFormFirstNameLabel") }}</label>
  <input id="first-name" type="text" name="firstname"><br>
  <label for="last-name">{{ gettext("snippetHTMLFormLastNameLabel") }}</label>
  <input id="last-name" type="text" name="lastname"><br>
  <input type="submit" value="{{ gettext("snippetHTMLFormSubmit") }}">
</form>
`,
      l10n: true
    }
  },
  {
    id: "snippet-script",
    name: "snippetHTMLScript",
    title: "snippetHTMLScriptTitle",
    data: {
      value: '<script src="script.js"></script>'
    }
  },
  {
    id: "snippet-external-stylesheet",
    name: "snippetHTMLExternalStylesheet",
    title: "snippetHTMLExternalStylesheetTitle",
    data: {
      value: `<!-- {{ gettext("snippetHTMLExternalStyleSheetComment") | safe }} -->
<link href="style.css" rel="stylesheet">
`,
      l10n: true
    }
  },
  {
    id: "snippet-video",
    name: "snippetHTMLVideo",
    title: "snippetHTMLVideoTitle",
    data: {
      value: `<video width="320" height="240" controls>
  <source src="video.mp4" type="video/mp4">
  {{ gettext("snippetHTMLVideoData") }}
</video>
`,
      l10n: true
    }
  },
  {
    id: "snippet-audio",
    name: "snippetHTMLAudio",
    title: "snippetHTMLAudioTitle",
    data: {
      value: `<audio controls>
  <source src="audio.mp3" type="audio/mpeg">
  {{ gettext("snippetHTMLAudioData") }}
</audio>
`,
      l10n: true
    }
  }
];

const css = [
  {
    id: "snippet-cssComment",
    name: "snippetCSSComment",
    title: "snippetCSSCommentTitle",
    data: {
      value: '/* {{ gettext("snippetCommentData") }} */\n',
      l10n: true
    }
  },
  {
    id: "snippet-tagNameSelector",
    name: "snippetCSSTagNameSelector",
    title: "snippetCSSTagNameSelectorTitle",
    data: {
      value: `p {
  font-size: 20px;
}
`
    }
  },
  {
    id: "snippet-classSelector",
    name: "snippetCSSClassSelector",
    title: "snippetCSSClassSelectorTitle",
    data: {
      value: `.className {
  background-color: green;
}
`
    }
  },
  {
    id: "snippet-idSelector",
    name: "snippetCSSIDSelector",
    title: "snippetCSSIDSelectorTitle",
    data: {
      value: `#idName {
  background-color: green;
}
`
    }
  },
  {
    id: "snippet-kfa",
    name: "snippetCSSKeyframe",
    title: "snippetCSSKeyframeTitle",
    data: {
      value: `/* {{ gettext("snippetCSSKeyframeAnimationTargetComment") }} */
.animated {
  animation-name: animationName;
  animation-duration: 4s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-out;
}

/* {{ gettext("snippetCSSKeyframeAnimationComment") }} */
@keyframes animationName {
  0%   { background-color: red;    }
  50%  { background-color: orange; }
  100% { background-color: yellow; }
}
`,
      l10n: true
    }
  },
  {
    id: "snippet-linkStyling",
    name: "snippetCSSAnchorStyle",
    title: "snippetCSSAnchorStyleTitle",
    data: {
      value: `/* {{ gettext("snippetCSSAnchorStyleUnvisitedLinkComment") }} */
a:link {
  color: RoyalBlue;
  text-decoration: none;
}

/* {{ gettext("snippetCSSAnchorStyleVisitedLinkComment") }} */
a:visited {
  color: Orchid;
}

/* {{ gettext("snippetCSSAnchorStyleActiveLinkComment") }} */
a:active {
  color: OrangeRed;
}

/* {{ gettext("snippetCSSAnchorStyleHoverLinkComment") }} */
a:hover {
  text-decoration: underline;
}
`,
      l10n: true
    }
  },
  {
    id: "snippet-mediaQueries",
    name: "snippetCSSMediaQuery",
    title: "snippetCSSMediaQueryTitle",
    data: {
      value: `@media screen and (max-width: 320px) {
  /* {{ gettext("snippetCSSMediaQueryNarrow") }} */
}

@media screen and (min-width: 321px) and (max-width: 768px) {
  /* {{ gettext("snippetCSSMediaQueryMedium") }} */
}

@media screen and (min-width: 769px) {
 /* {{ gettext("snippetCSSMediaQueryWide") }} */
}
`,
      l10n: true
    }
  },
  {
    id: "snippet-ffd",
    name: "snippetCSSFont",
    title: "snippetCSSFontTitle",
    data: {
      value: `@font-face {
  font-family: myFirstFont;
  src: url(sansation_bold.woff);
  font-weight: bold;
}
`
    }
  },
  {
    id: "snippet-pseudoElement",
    name: "snippetCSSPseudo",
    title: "snippetCSSPseudoTitle",
    data: {
      value: `/* {{ gettext("snippetCSSPseudoComment") | safe }} */
.arrow::before {
  content: "→";
  background: DodgerBlue;
  color: white;
}
`,
      l10n: true
    }
  }
];

const js = [
  {
    id: "snippet-jsComment",
    name: "snippetJSComment",
    title: "snippetJSCommentTitle",
    data: {
      value: '// {{ gettext("snippetCommentData") }}\n',
      l10n: true
    }
  },
  {
    id: "snippet-emptyFunction",
    name: "snippetJSFunction",
    title: "snippetJSFunctionTitle",
    data: {
      value: `function sayHello(name) {
  console.log({{ gettext("snippetJSLogHello") | safe }});
}

sayHello("{{ gettext("snippetJSPersonName1") }}");
`,
      l10n: true
    }
  },
  {
    id: "snippet-array",
    name: "snippetJSArray",
    title: "snippetJSArrayTitle",
    data: {
      value:
        'var names = ["{{ gettext("snippetJSPersonName1") }}", "{{ gettext("snippetJSPersonName2") }}", "{{ gettext("snippetJSPersonName3") }}"];\n',
      l10n: true
    }
  },
  {
    id: "snippet-object",
    name: "snippetJSObject",
    title: "snippetJSObjectTitle",
    data: {
      value: `var person = {
  name: "{{ gettext("snippetJSPersonName2") }}",
  skills: ["JS", "HTML"]
};
`,
      l10n: true
    }
  },
  {
    id: "snippet-forLoop",
    name: "snippetJSForLoop",
    title: "snippetJSForLoopTitle",
    data: {
      value: `var names = ["{{ gettext("snippetJSPersonName1") }}", "{{ gettext("snippetJSPersonName2") }}", "{{ gettext("snippetJSPersonName3") }}"];
var name;

for (var i = 0; i < names.length; i++) {
  name = names[i];
  console.log(name);
}
`,
      l10n: true
    }
  },
  {
    id: "snippet-whileLoop",
    name: "snippetJSWhileLoop",
    title: "snippetJSWhileLoopTitle",
    data: {
      value: `var count = 5;

while (count > 0) {
  console.log(count);
  count = count - 1;
}
`
    }
  },
  {
    id: "snippet-ifElse",
    name: "snippetJSIfElse",
    title: "snippetJSIfElseTitle",
    data: {
      value: `var name = "{{ gettext("snippetJSPersonName2") }}";

if (name === "{{ gettext("snippetJSPersonName2") }}") {
  console.log({{ gettext("snippetJSLogHello") | safe }});
} else if (name === "{{ gettext("snippetJSPersonName3") }}") {
  console.log({{ gettext("snippetJSLogHello") | safe }});
} else {
  console.log("{{ gettext("snippetJSLogHelloStranger") }}");
}
`,
      l10n: true
    }
  },
  {
    id: "snippet-switch",
    name: "snippetJSSwitchCase",
    title: "snippetJSSwitchCaseTitle",
    data: {
      value: `var name = "{{ gettext("snippetJSPersonName2") }}";

switch(name) {
  case "{{ gettext("snippetJSPersonName2") }}":
    console.log({{ gettext("snippetJSLogHello") | safe }});
    break;
  case "{{ gettext("snippetJSPersonName3") }}":
    console.log({{ gettext("snippetJSLogHello") | safe }});
    break;
  default:
    // {{ gettext("snippetJSConditionalDefaultComment") }}
    console.log("{{ gettext("snippetJSLogHelloStranger") }}");
}
  `,
      l10n: true
    }
  },
  {
    id: "snippet-clickhandler",
    name: "snippetJSClickHandler",
    title: "snippetJSClickHandlerTitle",
    data: {
      value: `// {{ gettext("snippetJSClickHandlerComment") | safe }}
var element = document.querySelector('#button');

element.addEventListener("click", function() {
  console.log("{{ gettext("Click!") }}");
});
`,
      l10n: true
    }
  },
  {
    id: "snippet-changestyle",
    name: "snippetJSChangeStyle",
    title: "snippetJSChangeStyleTitle",
    data: {
      value: `// {{ gettext("snippetJSChangeStyleComment") | safe }}
var element = document.querySelector('#alert');

element.style.background = "OrangeRed";
`,
      l10n: true
    }
  }
];

module.exports = {
  html,
  css,
  js
};
