Thimble
==================

[![Build Status](https://travis-ci.org/mozilla/thimble.mozilla.org.svg)](https://travis-ci.org/mozilla/thimble.mozilla.org)
[![Shipping fast with zenHub](https://raw.githubusercontent.com/ZenHubIO/support/master/zenhub-badge.png)](https://zenhub.com)
<a href="https://browserstack.com"><img src="https://assets.mofoprod.net/general/browserstack.svg" height="20rem"></a>

Thimble is Mozilla's online code editor that makes it easy to create and publish
your own web pages while learning HTML, CSS & JavaScript.  You can try it online
by visiting https://thimble.mozilla.org (or https://bramble.mofostaging.net for our
staging server).

![Thimble](/screenshots/thimble.png?raw=true "Thimble")

You can read more about some of Thimble's main features [in the wiki](https://github.com/mozilla/thimble.mozilla.org/wiki/Using-Thimble), or [watch a demo video](https://air.mozilla.org/thimble-demo/).

Thimble uses a modified version of the amazing [Brackets](http://brackets.io) code editor
[updated to run within web browsers](https://github.com/mozilla/brackets).  You can read more about
how it works in [this blog post](http://blog.humphd.org/thimble-and-bramble/).

Thimble requires a modern web browser, and we recommend using Mozilla Firefox or Google Chrome. We use [BrowserStack](https://browserstack.com) to test Thimble in modern browsers on different operating systems.

# Setup/Installation

Thimble interacts with the Publish API (source managed in [publish.webmaker.org](https://github.com/mozilla/publish.webmaker.org)) to store users, projects, files and other content as well as publish user projects.

For authentication and user management, Thimble uses Webmaker OAuth which consists of the Webmaker ID System (source managed in [id.webmaker.org](htps://github.com/mozilla/id.webmaker.org)) and the Webmaker Login API (source managed in [login.webmaker.org](https://github.com/mozilla/login.webmaker.org)).

All three services are bundled together using Git subtrees to be run together using Vagrant, or, they may be run separately with Thimble [manually](#manual-installation).

**Note:** The Git subtree bundle mentioned above for use with the automated installation can be found in the `/services` folder. It contains a subtree for each of the three services. These subtrees are not automatically kept in sync with their corresponding service's parent repositories. If you need to update one of the subtrees to match the history of its parent repository, follow these instructions:
  - Create a separate branch and checkout to it.
  - Run the following to get the history of the service's repository:

  ```
  git fetch https://github.com/mozilla/<service's repository name> <branch name>
  ```

  Replace `<service's repository name>` with the remote repository name of the service you are trying to update and `<branch name>` with the name of the branch on that repository you want to update the subtree with.<br>
  For e.g. `git fetch https://github.com/mozilla/publish.webmaker.org master`.
  - Now to update the subtree, run:

  ```
  git subtree pull --prefix services/<service's repository name> https://github.com/mozilla/<service's repository name> <branch name> --squash
  ```

  Replace `<service's repository name>` and `<branch name>` with the same values you used in the previous command.<br>
  For e.g. `git subtree pull --prefix services/publish.webmaker.org https://github.com/mozilla/publish.webmaker.org master --squash`.
  - Update your remote branch with this new change.
  - Open a pull request to have the subtree update reviewied and merged.

## Automated Installation (Preferred Method)
**Note:** If you aren't able to properly run virtualization software on your machine (for e.g. some versions of Windows only allow one virtualization client to run at a time and if that isn't VirtualBox, you can't run the required VirtualBox as well. This is often a problem if you have docker installed on Windows) or are trying to host Thimble on your own, refer to the [Manual Installation](#manual-installation) instructions instead.

### Prerequisites for Automated Installation
In order for Thimble to be installed correctly, the following dependencies need to be installed in order:

- Node.js (version 6.11.1 or later) [[download](https://nodejs.org/en/download/)]
- [Brackets (Bramble)](#installing-brackets-bramble)
- Virtualbox (version 5.1 or later) [[download](https://www.virtualbox.org/wiki/Downloads)]
- Vagrant (version 1.9 or later) [[download](https://www.vagrantup.com/downloads.html)]
  - __Note:__ On Windows machines, you may need to restart your computer after installing Vagrant for it to be fully usable.
  Avoid installation in directories containing *spaces*.  Vagrant is written in Ruby which has issues with directory names containing spaces, so be sure that your VAGRANT_HOME environment variable does not contain any spaces (i.e. a user home folder w/ spaces).  You can set VAGRANT_HOME via Control Panel > Advanced system settings > Environment variables > System Variables or set it from command prompt with [setx]%28https://technet.microsoft.com/en-us/library/cc755104(v=ws.11).aspx%29 command `setx VAGRANT_HOME c:\.vagrant.d -m`.
  For further safety, you can also check to make sure your VM snapshots are stored in a folder without spaces.  To do this, open the Virtualbox GUI, click Preferences > General > Default Machine Folder, and set your path here.

### Installing Brackets (Bramble)
- Fork the [Brackets repository](https://github.com/mozilla/brackets) and then clone it to your local machine using `git clone --recursive https://github.com/<your_username>/brackets.git` (replace `<your_username>` with your Github username for the account you forked Brackets into)
- In the cloned repository directory, run `npm install` to install the dependencies for Brackets
- Run `npm run build` to create the built editor files that will be used by Thimble
- Run `npm start` to start a server that will allow the editor to be accessed on [http://localhost:8000/src](http://localhost:8000/src)
 -- You can find out more information about setting up Brackets locally by referring to the instructions [here](https://github.com/mozilla/brackets#how-to-setup-bramble-brackets-in-your-local-machine)

### Installing Thimble and Services with Vagrant
The first step is to fork and clone Thimble and navigate to the cloned directory in a terminal shell.

For the first time, you need to install Thimble's dependencies and start all dependent services. To do this, simply run the following commands in succession:

```sh
npm run env
npm install
vagrant up
```
This process can take a while depending on your internet connection speed as it needs to download all dependencies.
The Vagrant VM is set to use 1 virtual CPU and 1.5G of RAM. If you find you need to adjust these resource levels, you can do so in the `/Vagrantfile`.

When Vagrant finishes provisioning the VM, all the services that Thimble relies on will be running. Now, you can start the Thimble server by running:
```sh
npm start
```
Once you see a log that says `Client files have been built. You can now load Thimble at http://localhost:3500`, you can access Thimble on [http://localhost:3500](http://localhost:3500).

You can terminate the Thimble server by hitting Ctrl-C.

Once the Thimble server is on, if you make changes to any file inside the `public` folder, your changes will automatically be picked up and you can see them by refreshing your browser tab. If you make changes to any other file, you will need to terminate the Thimble server and restart it using `npm start` for the changes to take effect.

To suspend the VM and temporarily stop the services Thimble relies on, use `vagrant suspend` (like putting it to sleep). You can also use `vagrant halt` to do a full shutdown of the services.

To restart the VM and Thimble's services again, re-run `vagrant up`.

To see logs for the services running in Vagrant, use `npm run services:logs`.

## Manual Installation
You can also setup Thimble and its needed components outside Vagrant and Virtualbox. This might be needed if you want to:
- Host your own instance of Thimble
- Cannot run virtualization software on your computer

### Prerequisites for Manual Installation
In order for Thimble to be installed correctly, the following dependencies need to be installed:

- Node.js 4.x or above (see note below)
  - **Note:** The login.webmaker.org dependency needs a node version of 4.x only while all the other dependencies work with a node version of 4.x and above (Thimble requires node 6.11.1 or above). We suggest installing [NVM](https://github.com/creationix/nvm) to allow the use of multiple versions of node.
- [Brackets (Bramble)](#installing-brackets-bramble)
- [Webmaker ID server](#idwebmakerorg)
- [Webmaker Publishing Server](#publishwebmakerorg)
- [Postgresql 9.4 or above (for the publish.webmaker.org dependency)](#postgresql)
- g++ 4.8 or above (for the login.webmaker.org dependency)
- [Webmaker Login Server](#loginwebmakerorg)

The following is an abbreviated guide to getting it all set up. Please see each server's README for more details.

### Manually Installing the Parts
Please note: On Windows, use ``copy`` instead of ``cp``

#### Thimble
* Fork and clone https://github.com/mozilla/thimble.mozilla.org
* Run ``npm run env`` to create an environment file
* Run ``npm install`` to install dependencies
* Run ``npm start`` to start the server

#### id.webmaker.org
* Clone https://github.com/mozilla/id.webmaker.org
* Run ``cp sample.env .env`` to create an environment file
* Run ``npm install`` to install dependencies
* Run ``npm start`` to start the server

#### login.webmaker.org
* Clone https://github.com/mozilla/login.webmaker.org
* Run ``npm install`` to install dependencies
* Run ``cp env.sample .env`` to create an environment file
* Run ``npm start`` the server

#### PostgreSQL
* Run ``initdb -D /usr/local/var/postgres`` to initialize PostreSQL
  * If this already exists, run ``rm -rf /usr/local/var/postgres`` to remove it
* Run ``postgres -D /usr/local/var/postgres`` to start the PostgreSQL server
* Run ``createdb publish`` to create the Publish database

#### publish.webmaker.org
* These steps assume you've followed the PostgreSQL steps above, including creating the publish database.
* Clone https://github.com/mozilla/publish.webmaker.org
* Run ``npm install`` to install dependencies
* Run ``npm run env``
* Run ``npm run knex`` to seed the publish database created earlier
* Run ``npm start`` to run the server

Once everything is ready and running, Thimble will be available at [http://localhost:3500/](http://localhost:3500/)

### Getting Ready to Publish
To publish locally, you'll need to do the following...

#### Teach the ID server about the Publish server

* Run ``createdb webmaker_oauth_test`` to create a test database
* In your id.webmaker.org folder
  * Run ``node scripts/create-tables.js``
  * Edit ``scripts/test-data.sql`` and replace its contents with:

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

#### Sign In

To publish locally, you'll need an account.
* At the top right corner of the Thimble main page click ``Sign In`` if you have an account or click ``Create an account`` and complete the process, you can use a fake email
* When you've created your account, you will automatically be logged in
* You will be redirected to the Thimble main page, and you can start working!

It's that simple! You are now ready to start using Thimble to its full potential!

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

We're a friendly group, so feel free to chat with us in the "Thimble" channel on Mozilla Chat running on [Mattermost](https://about.mattermost.com). To access Mozilla Chat head over to [chat.mozillafoundation.org](https://chat.mozillafoundation.org). Note that you will be prompted to create an account if you do not already have one. If you already have an account, and you are already logged in from a previous visit, you can directly access the Thimble channel by clicking on [this link](https://chat.mozillafoundation.org/mozilla/channels/thimble).

You can also download a mobile or desktop client for Mattermost [here](https://about.mattermost.com/download/#mattermostApps).
