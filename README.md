Thimble
==================

Thimble is Mozilla's online code editor that makes it easy to create and publish
your own web pages while learning HTML, CSS & JavaScript.  You can try it online
by visiting https://thimble.mozilla.org (or https://bramble.mofostaging.net for our
staging server).

![Thimble](/screenshots/thimble.png?raw=true "Thimble")

You can read more about some of Thimble's main features [in the wiki](https://github.com/mozilla/thimble.mozilla.org/wiki/Using-Thimble), or [watch a demo video](https://air.mozilla.org/thimble-demo/).

Thimble uses a modified version of the amazing [Brackets](http://brackets.io) code editor
[updated to run within web browsers](https://github.com/mozilla/brackets).  You can read more about
how it works in [this blog post](http://blog.humphd.org/thimble-and-bramble/).

Thimble requires a modern web browser, and we recommend using Mozilla Firefox or Google Chrome.

Setup
-----

Thimble is non-trivial to run locally, due to its dependence on a number of other
services.  In order to run Thimble, the following things are required. The following
is an abbreviated guide to getting it all set up.  Please see each server's README for more details.

**You'll need**
* Bramble
* Thimble
* Webmaker ID server
* Webmaker Login Server
* PostgreSQL Database
* Webmaker Publishing Server

## Installing the Parts

Please note: On Windows, use copy instead of cp

**Bramble**
* Fork and clone https://github.com/mozilla/brackets
* Run ``git submodule update --init`` to install submodules
* Run ``npm install`` to install dependencies
* Run `npm run build` to create `/dist` extensions and third-party libs
* Run ``npm start`` to get a static server running on [http://localhost:8000/src](http://localhost:8000/src). You can try the demo version at [http://localhost:8000/src/hosted.html](http://localhost:8000/src/hosted.html)
* For more information on setting up Bramble, refer to [Bramble Setup](https://github.com/mozilla/brackets#how-to-setup-bramble-brackets-in-your-local-machine)

**Thimble**
* Fork and clone https://github.com/mozilla/thimble.mozilla.org
* Run ``cp env.dist .env`` to create an environment file
* Run ``npm install`` to install dependencies
* Run ``npm run localize`` to generate the locale files
* Run ``npm start`` to start the server
* Once everything is ready and running, Thimble will be available at [http://localhost:3500/](http://localhost:3500/)

**id.webmaker.org**
* Clone https://github.com/mozilla/id.webmaker.org
* Run ``cp sample.env .env`` to create an environment file
* Run ``npm install`` to install dependencies
* Run ``npm start`` to start the server

**login.webmaker.org**
* Clone https://github.com/mozilla/login.webmaker.org
* Run ``npm install`` to install dependencies
* Run ``cp env.sample .env`` to create an environment file
* Run ``npm start`` the server
* **Note:** login.webmaker.org needs a node version of 0.12 while all the other dependencies work with a node version of 4.x and above. We suggest installing [NVM](https://github.com/creationix/nvm) to allow the use of multiple versions of node.

**PostgreSQL**
* Install Postgres via Homebrew
  * Get Homebrew - http://brew.sh/
  * Run ``brew install postgresql`` to install PostgreSQL once Homebrew is installed
* Run ``initdb -D /usr/local/var/postgres`` to initialize PostreSQL
  * If this already exists, run ``rm -rf /usr/local/var/postgres`` to remove it
* Run ``postgres -D /usr/local/var/postgres`` to start the PostgreSQL server
* Run ``createdb publish`` to create the Publish database

**publish.webmaker.org**
* These steps assume you've followed the PostgreSQL steps above, including creating the publish database.
* Clone https://github.com/mozilla/publish.webmaker.org
* Run ``npm install`` to install dependencies
* Run ``npm run env``
* Run ``npm install knex -g`` to install knex
* Run ``npm run knex`` to seed the publish database created earlier
* Run ``npm start`` to run the server

## Getting Ready to Publish
To publish locally, you'll need to do the following...

**1. Teach the ID server about the Publish server**

* Run ``createdb webmaker_oauth_test`` to create a test database
* In your id.webmaker.org folder
  * Run ``node scripts/create-tables.js``
  * Edit ``scripts/test-data.sql`` and replace it's contents with:

      ```sql
        INSERT INTO clients VALUES
          ( 'test',
            'test',
            '["password", "authorization_code"]'::jsonb,
            '["code", "token"]'::jsonb,
            'http://localhost:3500/callback' )
      ```

  * Run ``node scripts/test-data.js``
    * You'll see a ``INSERT 0 1`` message if successful

**2. Set up the local data folder**

Instead of publishing to Amazon AWS, we'll be publishing to a local folder. Perform the following steps to set this up.
* Run ``npm install -g http-server && mkdir -p /tmp/mox/test && cd /tmp/mox/test && http-server -p 8001``
* Run ``cd /tmp/mox/test && http-server -p 8001`` to start the server
* In your publish.webmaker.org folder
  * Open the ``.env`` file
  * Make sure that ``PUBLIC_PROJECT_ENDPOINT="localhost:8001"``` is set as shown here
  * Restart publish server

**3. Sign In**

To publish locally, you'll need an account.
* Go to [http://localhost:3000/account](http://localhost:3000/account)
* Click ``Join Webmaker`` and complete the process, you can use a fake email
* When you've created your account, click ``Set permanent password instead``
  * This lets you authenticate your account without needing email
* Go back to Thimble and Log In with your new account

## Running the parts
This is the list of commands to get each part up and running.

* Thimble ``npm start``
* Bramble ``npm start``
* PostgreSQL Database ``postgres -D /usr/local/var/postgres``
* Webmaker ID server ``npm start``
* Webmaker Login Server ``npm start``
* Webmaker Publishing Server ``npm start``
* Local publish folder ``cd /tmp/mox/test && http-server -p 8001``

Development additionals
-----------------------

We handle JS, HTML and CSS linting through grunt, which is very simple
to set up if you don't have it installed already:

```npm install -g grunt-cli```

After this, simpy run ```grunt``` before commiting code and you should
be good to go.

Building the front-end
----------------------

Run `grunt requirejs:dist` to regenerate the front-end `dist/` folder if you so desire (it's
only necessary in production). See `Gruntfile.js` for details.

Localization
----------------------

Please refer to the [Wiki](https://github.com/mozilla/thimble.mozilla.org/wiki/Localization) for information on the localization procedures used in Thimble.

##### Our Localization Community

[Our localization community](https://pontoon.mozilla.org/projects/thimble/contributors) is awesome! They work very hard to translate Thimble so that we can expand our global reach and engage even more users in other languages. We can't thank them enough!

Invalidating CloudFront
----------------------

To invalidate the production CloudFront distribution, make sure you have correct credentials set up in your env file. Then run `node invalidate.js`. Alternatively, if you have access to the heroku deployments, run the invalidation as a one-off dyno with `heroku run npm run invalidate`

