[![Build Status](https://travis-ci.org/mozilla/friendlycode.png?branch=gh-pages)](http://travis-ci.org/mozilla/friendlycode)

This is a friendly HTML editor that uses [slowparse][] and [hacktionary][]
to provide ultra-friendly real-time help to novice webmakers.

## Prerequisites

Using Friendlycode doesn't actually require anything other than a
static file server like Apache. However, if you want to generate optimized
builds and run the test suites, you'll need node 0.8+, npm 1.1+, and
phantomjs 1.7+.

## Quick Start

```bash
git clone --recursive git://github.com/mozilla/friendlycode.git
cd friendlycode
npm install
npm test
```

To run a simple built-in static file server from the repository's
root directory, run:

```bash
node bin/server.js
```

## Examples

You can see a trivial embedding at:

    http://localhost:8005/examples/bare.html

By default, friendlycode doesn't allow JS. An example of an
embedding that allows JS and publishes using an alternate API is
here:

    http://localhost:8005/examples/alternate-publisher.html

## Localization

We currently use Transifex for localization. To localize Friendlycode
in your language, please visit the 
[Transifex friendlycode project][transifex]. Any strings you don't
translate will fall-back to English.

### Trying out a Localization

Run `node bin/server.js` and visit 
`http://localhost:8005/examples/transifex.html`. If this doesn't work,
however&mdash;or if it runs too slowly for your tastes&mdash;you will have
to take the following steps.

1. Run `node bin/transifex.js -u user:pass`, where `user:pass` is your
   Transifex username and password. You can run `node bin/transifex.js --help`
   for information on more options, such as only importing strings that
   have been reviewed. This will export all Transifex localizations as
   requirejs i18n bundles in the `transifex` directory.

2. Run `node bin/server.js` and then visit 
   `http://localhost:8005/examples/transifex.html?local=1` to see your 
   localizations.

### Adding a new i18n bundle module

Before adding a new i18n bundle, first read the [requirejs i18n bundle][i18n] 
documentation.

When creating an i18n bundle, you only need to provide the root localization.
The following instructions assume that your new i18n bundle module is at
`js/fc/nls/foo`.

1. Run `node bin/build-i18n.js plist fc/nls/foo > foo.plist`. This will
   output a [Property List][] file to `foo.plist`, which Transifex can
   use as a template for localization.

2. Under friendlycode's [resource management page][] on Transifex, add
   a new resource with name `fc/nls/foo` and i18n type 
   `Apple PLIST files (.plist)`. Then upload the `foo.plist` file.

### Updating an existing i18n bundle module

If the root localization for an i18n bundle module has changed, follow the 
same steps for adding a new i18n bundle (above), but simply re-upload the
plist file for the existing module instead of creating a new one.

### Deploying an internationalized widget

See the source code in `examples/transifex.html` for information
on how to do this with unoptimized builds.

For optimized builds, use the `--i18n-url` option to `bin/build-require.js`
to create an optimized build that retrieves its localizations at run-time
from a different URL. For instance, if you deploy your Transifex
requirejs i18n bundles to `/locale`, running
`node bin/build-require.js --i18n-url="/locale/"` will create an
optimized build that loads localizations from that URL at runtime.

## Updating CodeMirror

In the `vendor/codemirror2` directory is a mini-distribution of
[CodeMirror][] which contains only the files necessary for HTML editing. It 
can be updated with the `bin/update-codemirror.py` script.

  [i18n]: http://requirejs.org/docs/api.html#i18n
  [slowparse]: https://github.com/mozilla/slowparse
  [hacktionary]: https://github.com/toolness/hacktionary
  [CodeMirror]: http://codemirror.net/
  [transifex]: https://www.transifex.com/projects/p/friendlycode/
  [resource management page]: https://www.transifex.com/projects/p/friendlycode/resources/
  [Property List]: http://help.transifex.com/features/formats.html#plist-format
