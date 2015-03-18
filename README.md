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

2) you'll need to fork and then clone the repo recursively:

```
git clone git@github.com:[yourname]/thimble.webmaker.org.git --recursive
```

3a) you may need the XCode console tools (on OSX) or the VC++ express + windows SKD 7.1 stack (on Windows) in order for node-gyp to compile some npm dependencies
3b) go into the thimble.webmaker.org dir and run ```npm install```

4) set up the environment variables (see next section).

5) [make-valet](https://github.com/mozilla/make-valet)

6) A way to statically serve the `/public/vendor/friendlycode/brackets` directory (examples below)

You can now run Thimble from the thimble.webmaker.org directory using

```node app```

and can serve the brackets application in a variety of ways:

```cd public/vendor/friendlycode/brackets && python -m SimpleHTTPServer```
or
```npm install -g live-server && cd public/vendor/friendlycode/brackets && live-server```

**NOTE:** Pay special attention to the ENV variable for this (`BRACKETS_URI`), since it must point at the url of the local server you run to serve the brackets resources

Finally, there is a special variable that enables an additional route
in the app for testing content deletion, `DELETE_ENABLED`. See app.js
for more details on the effect this variable has on running the app.

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

Together.js
-----------

There is a special library that we hook into for collaborative work called
together.js, https://togetherjs.com, which can be run either online or
localhost.

For most purposes you want to set the `TOGETHERJS` environment variable
in your `.env` to `https://togetherjs.com` so that thimble picks the standard
together.js library to do the collaboration work.

If you wish to test with a local together.js library and hub server, it
is strongly recommended that you use the webmaker-suite, instead, which
has together.js as one of the locally run components. Please visit
https://github.com/mozilla/webmaker-suite for more information on the suite.


Development additionals
-----------------------

We handle JS, HTML and CSS linting through grunt, which is very simple
to set up if you don't have it installed already:

```npm install -g grunt-cli```

After this, simpy run ```grunt``` before commiting code and you should
be good to go.

Deploying to Heroku
-------------------

If you want to test this code in a live environment, you can spin up a
heroku instance, and simply push up the master branch code. (read
the heroku tutorial on deploying a node.js application. If you follow
the instructions, it's super simple).

First, add the MySQL add-on for saving projects:

`heroku addons:add cleardb:ignite`

(See https://devcenter.heroku.com/articles/cleardb for more information)

Alternatively, you can rely on SQLite3 to act as database, but you will
lose all your data when your heroku instance goes to sleep, as it simply
resets the heroku instance to its deploy state. If that's fine, you can
use these environment variables rather than setting up ClearDB:

```
> heroku config:set DB_DIALECT="sqlite"
> heroku config:set DB_STORAGE="thimble.sqlite"
```

After doing this, you will then need to issue some (more) environment "SET"
commands to make sure things work. This is mostly making sure that all the
variables that are found in the `env.dist` file also exist in your heroku
environment:

```
> heroku config:set NODE_ENV="development"
> heroku config:set APP_HOSTNAME="http:// ...heroku instance..."
> heroku config:set AUDIENCE="http://[webmaker.org instance]"
> heroku config:set USERBAR="http://[login.webmaker.org instance]"
> heroku config:set LOGINAPI="http://testuser:password@[login.mofostaging.net instance]"
> heroku config:set MAKE_ENDPOINT="http://[makeapi instance]/"
> heroku config:set MAKE_AUTH="testuser:password"
> heroku config:set SESSION_SECRET="irrelephant"
```

If you're running your own heroku copies of all the webmaker.org services,
then you can simply point your heroku instance to the various other
instances. If, however, you are testing within the greater webmaker.org
suite of applications, you probably want to use the `*.mofostaging.net` URLs.

Also, for Amazon S3, the following values are quite important:

```
> heroku config:set S3_BUCKET="your bucket name"
> heroku config:set S3_KEY="your S3 access key"
> heroku config:set S3_SECRET="your private S3 secret string"
```

Note that when deploying to heroku, there will be no S3 emulation available.

A note on credentials
---------------------

The login credentials  in the `LOGINAPI` variable map to the `ALLOWED_USERS` variable used by the login instance that you rely on. This login regulates who can ask the login service for user information. It is not the list of "which persona user is allowed to access the login service".

The makeapi credentials map to the `ALLOWED_USERS` variable for the MakeAPI instance, and regulate who can query and push to the makeAPI. Again, this is not related to persona logins in any way.

Also note that the `SESSION_SECRET` environment variable is the secret that Thimble uses for setting its own local cookie, and can be any string you like (except an empty string).

New Relic
---------

To enable New Relic, set the `NEW_RELIC_ENABLED` environment variable and add a config file, or set the relevant environment variables.

For more information on configuring New Relic, see: https://github.com/newrelic/node-newrelic/#configuring-the-agent

Migration
---------

Various scripts are present that will assist in migrating old data sets along with Node.js scripts to update old records.

* `migrations/09052013-add-makeid-column.sql`
    * Used to add the `makeid` to the `ThimbleProject` data model. Using the script will depend on your SQL managing environment, but here's an example of using it in a commandline prompt:
        * `mysql < migrations/09052013-add-makeid-column.sql` - Assumes you have already done `use <DB_NAME>`

* `migrations/ThimbleProjectMigration.js`
    * Used to retrieve the `makeid` for any `ThimbleProject` that has already been published to the **MakeAPI**. This only needs to be run once.
        * `node migrations/ThimbleProjectMakeIDMigration.js` will execute this script, assuming proper `.env` variables have already been setup (instructions above).
