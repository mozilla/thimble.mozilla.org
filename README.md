Thimble
==================

[![Build Status](https://travis-ci.org/mozilla/thimble.mozilla.org.svg)](https://travis-ci.org/mozilla/thimble.mozilla.org)
[![Shipping fast with zenHub](https://raw.githubusercontent.com/ZenHubIO/support/master/zenhub-badge.png)](https://zenhub.com)

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

### Requirements

- Node.js (version 4.6 or later) [[download](https://nodejs.org/en/download/)]
- Virtualbox (version 5.1 or later) [[download](https://www.virtualbox.org/wiki/Downloads)]
- Vagrant (version 1.9 or later) [[download](https://www.vagrantup.com/downloads.html)]
  - __Note:__ On Windows machines, you may need to restart your computer after installing Vagrant for it to be fully usable

The setup of Thimble can be divided into two distinct sections:

### Editor

To fully use Thimble locally, you need to first setup Brackets locally first. This can be done by following the steps outlined below:

- Fork the [Brackets repository](https://github.com/mozilla/brackets) and then clone it to your local machine using `git clone --recursive https://github.com/<your_username>/brackets.git` (replace `<your_username>` with your Github username for the account you forked Brackets into)
- In the cloned repository directory, run `npm install` to install the dependencies for Brackets
- Run `npm run build` to create the built editor files that will be used by Thimble
- Run `npm start` to start a server that will allow the editor to be accessed on [http://localhost:8000/src](http://localhost:8000/src)
- You can find out more information about setting up Brackets locally by referring to the instructions [here](https://github.com/mozilla/brackets#how-to-setup-bramble-brackets-in-your-local-machine)

### Thimble and Services

Thimble interacts with the Publish API (source managed in [publish.webmaker.org](https://github.com/mozilla/publish.webmaker.org)) to store users, projects, files and other content as well as publish user projects.

For authentication and user management, Thimble uses Webmaker OAuth which consists of the Webmaker ID System (source managed in [id.webmaker.org](htps://github.com/mozilla/id.webmaker.org)) and the Webmaker Login API (source managed in [login.webmaker.org](https://github.com/mozilla/login.webmaker.org)).

All three services along with Thimble are bundled together using Git subtrees and run together using Vagrant.

The first step is to fork and clone Thimble and navigate to the cloned directory in a terminal shell.

For the first time, to start all dependent services and Thimble, simply run:
```
vagrant up
```
This process can take a while depending on your internet connection speed as it needs to download all dependencies. Once you see a log that says `Express server listening on http://localhost:3500`, you can access Thimble on [http://localhost:3500](http://localhost:3500).

You can now make changes to the Thimble source code on your system and they should be automatically reflected on [http://localhost:3500](http://localhost:3500).

To stop running Thimble, simply press `Ctrl+C` twice.

To restart Thimble again, run:
```
vagrant reload --provision
```
This will take a much shorter time to setup compared to the `vagrant up` command.

Localization
----------------------

Please refer to the [Wiki](https://github.com/mozilla/thimble.mozilla.org/wiki/Localization) for information on the localization procedures used in Thimble.

##### Our Localization Community

[Our localization community](https://pontoon.mozilla.org/projects/thimble/contributors) is awesome! They work very hard to translate Thimble so that we can expand our global reach and engage even more users in other languages. We can't thank them enough!

Invalidating CloudFront
----------------------

To invalidate the production CloudFront distribution, make sure you have correct credentials set up in your env file. Then run `node invalidate.js`. Alternatively, if you have access to the heroku deployments, run the invalidation as a one-off dyno with `heroku run npm run invalidate`

Concurrency
-----------

Thimble uses the [throng](https://www.npmjs.com/package/throng) module to leverage Node's [Cluster API](https://nodejs.org/api/cluster.html) for concurrency. To specify the number of server processes to start set `WEB_CONCURRENCY` to a positive integer value.
