defineTests(["inline-l10n"], function(InlineL10n) {
  module("inline-l10n");

  test("named key replaces default value", function() {
    equal(InlineL10n("L10N:meh[[[hello]]] there", {
      meh: "bonjour"
    }), "bonjour there");
  });
  
  test("default value used when named key unavailable", function() {
    equal(InlineL10n("L10N:meh[[[hello]]] there", {}), "hello there");
  });
  
  test("key name defaults to default value", function() {
    equal(InlineL10n("L10N[[[hello]]] there", {
      hello: 'bonjour'
    }), "bonjour there");
  });

  test("L10N accepts newlines inside default value", function() {
    equal(InlineL10n("L10N:meh[[[hel\nlo]]] there", {
      meh: "bonjour"
    }), "bonjour there");
  });

  test("multiple occurrences of L10N expressions work", function() {
    equal(InlineL10n("L10N:meh[[[hi]]] there L10N[[[u]]]", {
      meh: "bonjour",
      u: "nom"
    }), "bonjour there nom");
  });
  
  test("parse() returns mapping of keys to default values", function() {
    deepEqual(InlineL10n.parse("L10N[[[hello]]] there"), {
      hello: 'hello'
    }, "works w/ unnamed keys");
    deepEqual(InlineL10n.parse("L10N:meh[[[hello]]] there"), {
      meh: 'hello'
    }, "works w/ named keys");
  });
});
