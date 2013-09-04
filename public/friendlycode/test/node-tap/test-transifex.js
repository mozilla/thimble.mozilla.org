var test = require("tap").test;
var rootDir = require('path').resolve(__dirname, '..', '..');
var transifex = require(rootDir + '/bin/transifex');

// Example response from a URL of the form:
//
//   /api/2/project/<project_slug>/resource/<resource_slug>/translation/<language_code>/strings/
//
// For more information, see:
//
//   http://help.transifex.com/features/api/index.html#translations-for-a-collection-of-strings

var translationsForACollectionOfStrings = [
  {
    "comment": "This string appears in https://github.com/mozilla/blah.",
    "context": "",
    "key": "Facebook",
    "reviewed": false,
    "pluralized": false,
    "source_string": "Facebook",
    "translation": ""
  },
  {
    "comment": "This string appears in https://github.com/mozilla/blah.",
    "context": "",
    "key": "Are you sure you want to publish your page?",
    "reviewed": false,
    "pluralized": false,
    "source_string": "Are you sure you want to publish your page?",
    "translation": "blargyblarg?"
  },
  {
    "comment": "This string appears in https://github.com/mozilla/blah.",
    "context": "",
    "key": "error-warning",
    "reviewed": true,
    "pluralized": false,
    "source_string": "<strong>warning!</strong>",
    "translation": "<strong>Achtung!</strong>"
  }
];

// Example response from a URL of the form:
//
//   /api/2/project/<project_slug>/resource/<resource_slug>/?details
//
// For more information, see:
//
//   http://help.transifex.com/features/api/index.html#resource-instance-methods

var resourceDetails = {
  "category": null,
  "source_language_code": "en",
  "name": "slowparse-errors/nls/forbidjs",
  "created": "2013-01-23 23:36:34",
  "accept_translations": true,
  "i18n_type": "PLIST",
  "project_slug": "friendlycode",
  "wordcount": 91,
  "last_update": "2013-01-23 23:36:34",
  "available_languages": [
    {
      "rule_few": null,
      "code_aliases": " ",
      "code": "en",
      "description": "",
      "_state": "<django.db.models.base.ModelState object at 0x6268290>",
      "pluralequation": "(n != 1)",
      "rule_zero": null,
      "rule_many": null,
      "rule_two": null,
      "rule_one": "n is 1",
      "rule_other": "everything else",
      "nplurals": 2,
      "specialchars": "",
      "id": 20,
      "name": "English"
    },
    {
      "rule_few": null,
      "code_aliases": " en-US ",
      "code": "en_US",
      "description": "",
      "_state": "<django.db.models.base.ModelState object at 0x6268750>",
      "pluralequation": "(n != 1)",
      "rule_zero": null,
      "rule_many": null,
      "rule_two": null,
      "rule_one": "n is 1",
      "rule_other": "everything else",
      "nplurals": 2,
      "specialchars": "",
      "id": 98,
      "name": "English (United States)"
    }
  ],
  "total_entities": 3,
  "slug": "slowparse-errorsnlsforbidjs"
};

// Example response from a URL of the form:
//
//   /api/2/project/<project_slug>/?details
//
// For more information, see:
//
//   http://help.transifex.com/features/api/index.html#project-instance-methods

var projectDetails = {
  "feed": "",
  "source_language_code": "en",
  "description": "World's friendliest HTML editor.",
  "created": "2013-01-23 14:45:08",
  "trans_instructions": "",
  "tags": "",
  "teams": [
    "en_US"
  ],
  "maintainers": [
    {
      "username": "toolness"
    }
  ],
  "private": false,
  "slug": "friendlycode",
  "anyone_submit": false,
  "outsource": null,
  "fill_up_resources": false,
  "bug_tracker": "",
  "owner": {
    "username": "toolness"
  },
  "homepage": "",
  "long_description": "",
  "resources": [
    {
      "slug": "slowparse-errorsnlsforbidjs",
      "name": "slowparse-errors/nls/forbidjs"
    }
  ],
  "name": "Friendlycode"
};

test("toBundleLocale() works", function(t) {
  t.equal(transifex.toBundleLocale("en_US"), "en-us", "with region");
  t.equal(transifex.toBundleLocale("en-us"), "en-us", "idempotency");
  t.equal(transifex.toBundleLocale("en"), "en", "without region");
  t.end();
});

test("toTransifexLocale() works", function(t) {
  t.equal(transifex.toTransifexLocale("en-us"), "en_US", "with region");
  t.equal(transifex.toTransifexLocale("en_US"), "en_US", "idempotency");
  t.equal(transifex.toTransifexLocale("en"), "en", "without region");
  t.end();
});

test("parseProjectDetails() works", function(t) {
  t.deepEqual(transifex.parseProjectDetails(projectDetails), {
    "slowparse-errors/nls/forbidjs": {
      slug: "slowparse-errorsnlsforbidjs",
      path: "slowparse-errors/nls",
      moduleName: "forbidjs"
    }
  });
  t.end();
});

test("toBundleMetadata() works", function(t) {
  t.deepEqual(transifex.toBundleMetadata(resourceDetails), {
    "root": true,
    "en-us": true
  });
  t.end();
});

test("toBundleDict({reviewedOnly: true}) works", function(t) {
  t.deepEqual(transifex.toBundleDict({
    strings: translationsForACollectionOfStrings,
    reviewedOnly: true
  }), {
    "error-warning": "<strong>Achtung!</strong>"
  });
  t.end();
});

test("toBundleDict({reviewedOnly: false}) works", function(t) {
  t.deepEqual(transifex.toBundleDict({
    strings: translationsForACollectionOfStrings,
    reviewedOnly: false
  }), {
    "Are you sure you want to publish your page?": "blargyblarg?",
    "error-warning": "<strong>Achtung!</strong>"
  });
  t.end();
});
