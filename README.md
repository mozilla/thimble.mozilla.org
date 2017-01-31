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

Thimble interacts with the Publish API (source managed in [publish.webmaker.org](https://github.com/mozilla/publish.webmaker.org)) to store users, projects, files and other content as well as publish user projects.

For authentication and user management, Thimble uses Webmaker OAuth which consists of the Webmaker ID System (source managed in [id.webmaker.org](htps://github.com/mozilla/id.webmaker.org)) and the Webmaker Login API (source managed in [login.webmaker.org](https://github.com/mozilla/login.webmaker.org)).

All three services along with Thimble are bundled together using Git subtrees and run together using Vagrant.

Setup
-----

### Pre-Requisites
In order for Thimble to execute correctly, the following dependencies needs to be installed:

- Brackets (Bramble) [[download](https://github.com/mozilla/brackets)]
- Node.js (version 4.6 or later) [[download](https://nodejs.org/en/download/)]
- Virtualbox (version 5.1 or later) [[download](https://www.virtualbox.org/wiki/Downloads)]
- Vagrant (version 1.9 or later) [[download](https://www.vagrantup.com/downloads.html)]
  - __Note:__ On Windows machines, you may need to restart your computer after installing Vagrant for it to be fully usable.

Only continue the Thimble installation after the above has been successfully installed!

### Installing Thimble

After forking and cloning Thimble, installing it is quite simple. All we need to do is run the following command inside the cloned directory and let vagrant do the heavy lifting for us:

```
vagrant up
```

Depending on your internet connection speed, this process can take a while (Since it needs to download all dependencies not listed above).
Once you see `Express server listening on http://localhost:3500`, you are ready to start using Thimble!
Any changes made to the Thimble source code on your system will automatically be reflected on [http://localhost:3500](http://localhost:3500).

To stop Thimble, simply press `Ctrl+C` twice.

To restart Thimble, run:

```
vagrant reload --provision
```

This will take less time to setup compared to the `vagrant up` command.

### Running Brackets (Bramble)

After starting Thimble, Brackets also needs to be started. On your local machine, navigate to the cloned version of Brackets and run the following command:

```
npm start
```

It's that simple! You are now ready to start using Thimble to its full pontetial!

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

Contact Us
-----------

We're a friendly group, so feel free to chat with us in the "Thimble" channel on Mozilla Chat running on [Mattermost](https://about.mattermost.com). To access Mozilla Chat head to [this link]( http://chat.mozillafoundation.org). Note that you will need to create an account first.

You can also download a mobile or desktop client for Mattermost [here](https://about.mattermost.com/download/#mattermostApps).
