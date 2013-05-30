Thimble on Node.js
==================

This is a port of Thimble, the mozilla webmaker tool for writing and editing
HTML and CSS right in your browser (https://thimble.webmaker.org) from its
Playdoh-embedded python implementation to a dedicated ust-Thimble Node.js
implementation.

While the python implementation relied on Bleach for sanitization, no such
module exists (satisfactorily) for Node.js, so this version relies on a
RESTful Bleach endpoint; the code for this endpoint can be found at:

```
https://github.com/pomax/htmlsanitizer.org
```

The Thimble port and its custom Bleach endpoint are dev-deployed at
http://calm-headland-1764.herokuapp.com and http://peaceful-crag-3591.herokuapp.com,
respectively.

Setup
-----

In order to run Thimble, the following things are required:

1) you will need to have node installed
2) you'll need to fork and then clone the repo recursively:

```
git clone git@github.com:[yourname]/thimble.webmaker.org.git --recursive
```

3) you'll also need to clone the custom sanitization REST service that Thimble uses:

```
git clone git://github.com/Pomax/htmlsanitizer.org.git
```
(this is a version of htmlsanitizer.org with a modified Bleach that can deal with
full documents, rather than document fragments)

4) go into the thimble.webmaker.org dir and run ```npm install```

5) as an optional step, when you don't want to test with a live AWS-S3 instance, you
can set up fake-s3 to handle the S3 publication:

```
gem install fakes3
mkdir fakes3
```

**NOTE:** this requires ruby. If you do not have this installed, visit http://ruby-lang.org

6) set up the environment variables (see next section).

You are now ready to run the app, by first starting up the sanitizer in the
htmlsanitizer.org directory, by running ```python app.py```

In addition, launch the fake S3 service in a terminal with:

```
fakes3 -r ./fakes3 -h localhost -p 6060
```

You can then run Thimble from the thimble.webmaker.org directory using
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

**NOTE:** If you are using fakes3, you will need to make sure that
[bucket].localhost points to localhost, which most likely requires
you to add the following rule to your hosts file:

```
127.0.0.1 bucketName.localhost
```

If your bucket name is "test", then this rule should point to
test.localhost, if your bucket name is "potato", point to potato.localhost,
etc.

Note that this file is used on all conventional operation systems, but
lives in different places:

* on *n*x, it is located at ```<systemroot>/etc/hosts```
* on OSX, it is located at ```<systemroot>/private/etc/hosts```
* on Windows, it is located at ```<systemroot>\system32\drivers\etc\hosts```

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
> heroku config:set HOSTNAME="htt:// ...heroku instance..."
> heroku config:set AUDIENCE="http://[webmaker.org instance]"
> heroku config:set USERBAR="http://[login.webmaker.org instance]"
> heroku config:set LOGINAPI="http://testuser:password@[login.mofostaging.net instance]"
> heroku config:set MAKE_ENDPOINT="http://[makeapi instance]/"
> heroku config:set MAKE_AUTH="testuser:password"
> heroku config:set BLEACH_ENDPOINT="http://peaceful-crag-3591.herokuapp.com"
> heroku config:set SESSION_SECRET="irrelephant"
```

That should be enough to ensure the deployed version has all the environment
variables that it will rely on. The BLEACH_ENDPOINT url is where we are
currently hosting the custom htmlsanitizer.org code. If you want to run
your own copy, create another heroku instance and read the tutorial on
setting up a python instance.

All the other services are correspondingly free: If you're running your
own heroku copies of all the webmaker.org services, then you can simply
point your heroku instance to the various other instances. If, however,
you are testing within the greater webmaker.org suite of applications,
you probably want to use the `*.mofostaging.net` URLs.

Also, for Amazon S3, the following values are quite important:

```
> heroku config:set S3_BUCKET="your bucket name"
> heroku config:set S3_KEY="your S3 access key"
> heroku config:set S3_SECRET="your private S3 secret string"
```

Unless you're using FakeS3, in which case you can scroll up to the FakeS3
section, which explains the environment variables when using fake publishing.
Although FakeS3 also gets reset when your app gets restarted, so if you
want persistent data, it is strongly recommended to use a real S3 bucket.

A note on credentials
---------------------

The login credentials  in the `LOGINAPI` variable map to the `ALLOWED_USERS`
variable used by the login instance that you rely on. This login regulates
who can ask the login service for user information. It is not the list of
"which persona user is allowed to access the login service".

The makeapi credentials map to the `ALLOWED_USERS` variable for the
MakeAPI instance, and regulate who can query and push to the makeAPI.
Again, this is not related to persona logins in any way.

Also note that the `SESSION_SECRET` environment variable is the secret
that Thimble uses for setting its own local cookie, and can be any
string you like (except an empty string).

New Relic
---------

To enable New Relic, set the `NEW_RELIC_ENABLED` environment variable and add a config file, or set the relevant environment variables.

For more information on configuring New Relic, see: https://github.com/newrelic/node-newrelic/#configuring-the-agent
