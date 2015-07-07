Thimble on Node.js
==================

This is a port of Thimble, the mozilla webmaker tool for writing and editing
HTML and CSS right in your browser (https://thimble.webmaker.org) from its
Playdoh-embedded python implementation to a dedicated ust-Thimble Node.js
implementation.

**NOTE: This README assumes that you have all the required external dependencies installed and have a working dev environment. New to Webmaker? Make sure to read our [developer guide](https://wiki.mozilla.org/Webmaker/Code) for everything you need in order to get started!**

Setup
-----

In order to run Thimble, the following things are required:

1) you will need to have node installed

You can find node on http://nodejs.org or your package manager.

2) you'll need to fork and then clone the repo:

```
git clone git@github.com:[yourname]/thimble.webmaker.org.git
```

3a) you may need the XCode console tools (on OSX) or the VC++ express + windows SKD 7.1 stack (on Windows) in order for node-gyp to compile some npm dependencies
3b) go into the thimble.webmaker.org dir and run ```npm install```

4) set up the environment variables (see next section).

6) A way to statically serve our [bramble code editor](http://github.com/humphd/brackets) ([see below](#bramble-code-editor))

You can now run Thimble from the thimble.webmaker.org directory using

```node app```

Environment variables
---------------------

There is a special file that is used for environment variables in lieu of
actually setting these for development purposes. The base file is
```env.dist``` and is self documented. Simply run through it and set your
values accordingly. To use these values during development, copy this
file:

```
cp env.dist .env
```

and the Thimble code will pick up on it when run through node.

Development additionals
-----------------------

We handle JS, HTML and CSS linting through grunt, which is very simple
to set up if you don't have it installed already:

```npm install -g grunt-cli```

After this, simpy run ```grunt``` before commiting code and you should
be good to go.

Building the front-end
----------------------

Run `grunt build` to regenerate the front-end logic and css files. For production,
run with `grunt build:prod` to get minified versions, and run `grunt build:prod:true` to enable
auto building whenever a front-end file changes. See `Gruntfile.js` for details.

**NOTE:** Our front-end is in transition from an older architecture using Requirejs to
a new one using our build system. Check in our IRC channel (irc.mozilla.org#thimble) for
the latest state of development.

Bramble code editor
-------------------

In order to load Thimble, the bramble code editor must be statically served separately.
The simplest way to do this is to:

1) Clone the editor (outside your cloned Thimble source)

```
git clone https://github.com/humphd/brackets.git --recursive
```

2) Install all dependencies (you will need to be in the brackets directory)

```
npm install && git submodule update --init
```

3) Serve the root folder of this repo statically. Thimble will look for it on localhost:8000 by default. Here are some examples:

```
python -m SimpleHTTPServer
```

   or

```
npm install -g live-server && live-server --port=8000
```

**NOTE:** Pay special attention to Thimble's BRACKETS_URI ENV variable, since it must point at the URL of the local server you created in step 3. By default, this would be [http://localhost:8000](http://localhost:8000)
