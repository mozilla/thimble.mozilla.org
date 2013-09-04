"use strict";

define([
  "i18n!fc/nls/resourcelinks",
  "localized"
], function(Resourcelinks, Localized) {
  // A help index provides context-sensitive help for an HTML document,
  // indexed by characters in the HTML source code.
  function HelpIndex() {
    // A mapping from character indices in source code to associated
    // context-sensitive help information.
    var helpIndex = [];

    return {
      // Clear the help index.
      clear: function() {
        helpIndex = [];
      },
      // Build a new help index based on the given HTML and its DOM
      // representation, which should be annotated by Slowparse.
      build: function(document, html) {
        buildHelpIndex(document, helpIndex, html);
      },
      // Return the context-sensitive help information for a particular
      // position in the source code, or undefined if no help is available.
      get: function(index) {
        return getHelp(index, helpIndex);
      }
    };
  }

  // Return the context-sensitive help information for a particular
  // position in the source code, or undefined if no help is available.
  function getHelp(index, helpIndex) {
    Localized.ready(function(){});
    var help = helpIndex[index];
    if (help) {
      if (help.type == "tag")
        return {
          type: help.type,
          html: Localized.get(help.value),
          url: Help.MDN_URLS.html + help.value,
          highlights: help.highlights
        };
      else if (help.type == "cssProperty")
        return {
          type: help.type,
          html: Localized.get(help.value),
          url: Help.MDN_URLS.css + help.value,
          highlights: help.highlights
        };
      else if (help.type == "cssSelector")
        return {
          type: help.type,
          html: Localized.get("css-selector-docs"),
          url: Help.MDN_URLS.cssSelectors,
          highlights: help.highlights
        };
    }
  }

  // "Normalize" a tag name by converting e.g. any heading level to h1,
  // so that they can be easily looked up in the hacktionary.
  function normalizeTagName(tagName) {
    tagName = tagName.toLowerCase();
    if (tagName.match(/^h[1-6]$/))
      return "h1";
    return tagName;
  }

  // Recursively build the help index mapping source code indices 
  // to context-sensitive help.
  function buildHelpIndex(element, helpIndex, html) {
    var i, child,
        pi = element.parseInfo,
        tagInfo = {
          type: "tag",
          value: normalizeTagName(element.nodeName),
          highlights: []
        };
    if (pi) {
      if (pi.openTag) {
        tagInfo.highlights.push(pi.openTag);
        for (i = pi.openTag.start + 1;
             i < pi.openTag.start + element.nodeName.length + 2;
             i++)
          helpIndex[i] = tagInfo;
      }
      if (pi.closeTag) {
        tagInfo.highlights.push(pi.closeTag);
        for (i = pi.closeTag.start + 1; i < pi.closeTag.end; i++)
          helpIndex[i] = tagInfo;
      }
    }
    for (i = 0; i < element.childNodes.length; i++) {
      child = element.childNodes[i];
      if (child.nodeType == element.ELEMENT_NODE) {
        buildHelpIndex(child, helpIndex, html);
      }
      if (element.nodeName == "STYLE" && child.parseInfo.rules) {
        child.parseInfo.rules.forEach(function(rule) {
          var selectorInfo = {
            type: "cssSelector",
            highlights: [rule.selector]
          };
          for (var i = rule.selector.start; i < rule.selector.end; i++)
            helpIndex[i] = selectorInfo;
          rule.declarations.properties.forEach(function(prop) {
            var cssInfo = {
              type: "cssProperty",
              value: html.slice(prop.name.start, prop.name.end).toLowerCase(),
              highlights: [prop.name]
            };
            for (var i = prop.name.start; i < prop.name.end; i++)
              helpIndex[i] = cssInfo;
          });
        });
      }
    }
  }
  
  var Help = {
    Index: HelpIndex,
    // URLs for help on the Mozilla Developer Network.
    MDN_URLS: {
      html: Resourcelinks["mdn_url_html"],
      css: Resourcelinks["mdn_url_css"],
      cssSelectors: Resourcelinks["mdn_url_css_selectors"]
    }
  };

  return Help;
});
