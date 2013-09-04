// **inline-l10n** is a ridiculously simple localization preprocessor
// and micro-library for any kind of plain-text file. It is designed
// to be simple to use and easy to debug, and works independently of
// any specific localization format such as [gettext][] or
// `.properties` files.
//
// To use it, simply surround any localizable strings in your
// text file with `L10N[[[` on the left side and `]]]` on the right
// side. This usage is similar to gettext's `_()` function:
// when localizing, the source string will be used as a key to
// find a translation. For example, suppose your text file contains
// the following line:
//
//     <p>L10N[[[hello]]]</p>
//
// When localizing, the string `hello` will be used as a
// key for which a translation will be sought. If one is
// found—let's say it's `bonjour`—then the localized output
// will be:
//
//     <p>bonjour</p>
//
// However, if no translation is found, the output will be:
//
//     <p>hello</p>
//
// Alternatively, if you'd prefer to specify your own key names
// for locating translations, you can surround the left side of
// a string with `L10N:keyname[[[`, where `keyname` is the name
// of the key you'd like to use. For example:
//
//     <p>L10N:warning-msg[[[that might be a bad idea!]]]</p>
//
// Then a translation will be sought for `warning-msg`, rather
// than `that might be a bad idea!`.
//
// ## Multi-line Strings
//
// Note also that localizable strings can span multiple lines,
// so this works:
//
//     <p>L10N:warning-msg[[[
//        Whoa dude, that might be a really bad idea. Are you
//        quite certain you'd like to proceed?]]]</p>
//
// ## Character Escaping
//
// To keep things simple and debuggable, this library doesn't ever
// escape the contents of localizations. If you're writing HTML in
// a localizable string and need to write `L10N[[[` or `]]]`,
// you can use `L10N&#91;&#91;&#91;` and `&#93;&#93;&#93;` instead,
// respectively.
//
// ## Security
//
// Because this library doesn't escape the contents of localizations,
// it's assumed that all localized strings are trusted.
// 
//   [gettext]: http://en.wikipedia.org/wiki/Gettext

define(function() {
  var L10N_RE = /L10N(?:\:([a-z\-]+))?\[\[\[([\s\S]+?)\]\]\]/g;

  // ## Localizing
  //
  // `InlineL10n()` is the primary localization function that
  // takes a string to be localized and an object mapping key
  // names to translations. For example:
  //
  //     InlineL10n('<p>L10N[[[hello]]]</p>', {'hello': 'bonjour'});
  //
  // will return the string `<p>bonjour</p>`.
  
  var InlineL10n = function InlineL10n(str, l10n) {
    return str.replace(L10N_RE, function(match, key, value) {
      if (!key)
        key = value;
      if (key in l10n)
        return l10n[key];
      return value;
    });
    return str;
  };

  // ## Scanning For Localizable Strings
  //
  // Most localization code needs to "scrape" its files to find
  // localizable content. `InlineL10n.parse()` can be used to
  // return an object mapping key names to their default values.
  // For example:
  //
  //     InlineL10n('<p>L10N[[[hello]]] L10N:lol[[[meh]]]</p>');
  //
  // will return `{hello: "hello", lol: "meh"}`.
  
  InlineL10n.parse = function InlineL10n_parse(str) {
    var defaultValues = {};
    str.replace(L10N_RE, function(match, key, value) {
      if (!key)
        key = value;
      defaultValues[key] = value;
    });
    return defaultValues;
  };
  
  return InlineL10n;
});
