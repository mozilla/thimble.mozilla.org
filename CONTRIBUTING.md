# Contributing to Thimble


So, you'd like to contribute to Thimble - that's great, we're excited to have you! Thimble is developed by people from all over the world, some just learning to program and others with lots of experience. It's fun and a great way to learn about and advance the open web.

Read through this quick guide for some basic tips. They will help your first contribution go more smoothly.  You can also read [this blog post](http://blog.humphd.org/fixing-a-bug-in-mozilla-thimble/) for a walkthrough of fixing a bug.

### Table of Contents

* [Filing a Bug](#found-a-bug-file-an-issue)
* [Working on your first Issue](#working-on-your-first-issue)

<hr/>

## Found a bug? File an issue
One of the important ways in which you can contribute to Thimble is by filing bug reports when you run into any issues using Thimble.

* **[File an Issue Here](https://github.com/mozilla/thimble.mozilla.org/issues/new)**

**Guidelines**

* Write a descriptive issue title
  * Bad - ``Editor is broken``
  * Good - ``Editor is not responsive after publishing a project``
* Provide a thorough description of the problem
  * What browser and OS are you using?
  * Does the problem happen all of the time?
* Write out a series of steps for reproducing the bug, for example...
  * Step 1) Create a new project
  * Step 2) Add a second HTML file named "broken.html"
  * Step 3) The editor stops responding at this point
* If possible, include a screenshot of what you are seeing
* Check the console in your browser's developer tools
  * If you see any red errors, incliude a screenshot of those as well

## Working on your first Issue
* [Find a Good First Issue](#find-a-good-first-issue)
* [Claim the issue for yourself](#claim-the-issue-for-yourself)
* [Work on your issue](#work-on-your-issue)
* [Keep "tabs" on your indentation](#keep-tabs-on-your-indentation)
* [Get help](#get-help)
* [Submit a Pull Request](#submit-a-pull-request)
* [Check if your Pull Request is good to go](#check-if-your-pull-request-is-good-to-go)


### Get to know both repositories

Thimble it made up of two parts, each with a separate repository. The [Thimble](https://github.com/mozilla/thimble.mozilla.org/) repo has the homepage as well as all of the UI above the actual editor windows. The [Brackets](https://github.com/mozilla/brackets/) repo (aka, 'Bramble' or 'BRAckets in thiMBLE') contains the editor.  We separate the two apps for security reasons, since our Brackets editor allows users to write and then execute random JavaScript.  By hosting these from different origins, we isolate them and keep everything secure.  It makes development a bit harder, but keeps our users safe.

Go ahead and check them out, the README.md file in each repo contains the instructions on how to get your local development environment up and running.

* [Thimble](https://github.com/mozilla/thimble.mozilla.org/)
* [Brackets](https://github.com/mozilla/brackets/)

### Find a good first issue

Now that you've got your environment up and running, look through the issues in each repo to find a good starter issue. We've used the **Good First Bug** label to indicate which issues are a good place to start. Have a look...

* [Thimble - Good First Bugs](https://github.com/mozilla/thimble.mozilla.org/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+bug%22)
* [Brackets - Good First Bugs](https://github.com/mozilla/brackets/issues?q=is%3Aopen+is%3Aissue+label%3A%22Good+First+Bug%22)

### Claim the issue for yourself

Once you've found a bug that you are interested in working on...

* Scan over the issue comments and check the **Assignees** section on the right-hand side to make sure someone isn't already working on the issue
* Leave a comment indicating that you want to work on the issue
  * We'll assign you and add a **Assigned to Contributor** label
  * This lets everyone know the issue is being worked on and someone won't take it on at the same time
* Take one issue at a time
* If someone has claimed an issue but it seems like they've stopped working on it, leave a comment asking them if it's okay to take over the work
* If you decide to stop working on the issue you took, let us know in the issue
* If you choose an issue with a **brackets** label, your changes need to be made in the [brackets](https://github.com/mozilla/brackets) repository.

### Work on your issue

When you begin working to solve the issue in your local environment, do the work in a new branch that references the issue number or problem that you are solving.

* Before you begin, make sure you can reproduce the problem in the issue (if it's a bug) or that you understand the requirements (if it's a new feature).
  * Ask lots of questions in the issue if you're unsure
* Create a new branch for your work based on the latest version of the ``master`` branch
  * Give your branch a descriptive name like ``remix-button-not-showing``
* If your work is taking more than a few days, drop a comment in the original issue to let everyone know your progress

### Keep "tabs" on your indentation :drum:

Many first-time contributors run into problems when indenting the code, often mixing spaces and tabs. Our general convention to use spaces. A good guideline is to follow the conventions of the code that you are editing.

**In your editor**
* There is a setting like **Show Invisible Characters**. Turn it on and you'll be able to see the difference between tab and space characters.
* You can pick the type of ``tab`` you want to use: choose ``Spaces``

**Here's the difference between tabs and spaces**

<img width="362" src="http://i.imgur.com/YOUchxh.png" />


Also make sure the last line of the files you are working on ends with a **line-break**.

### Get help

You'll probably need when working on your issue, and there are a few ways to do that. You can...

* Leave a comment in the issue and use the ``@name`` syntax ask for someone's help specifically
* Join [Mozilla Foundation Chat](https://chat.mozillafoundation.org/)
  * Once you create an account go to the [Thimble Channel](https://chat.mozillafoundation.org/mozilla/channels/thimble)

### Submit a Pull Request

Once you've got a solution (or a good start) to the issue in your local environment, you'll want to make a Pull Request so that we can look at your code and eventually merge it in.

Before submitting a Pull Request, make sure your code passes our code style guide tests. To do that, simply run `npm test` to see if there are any code style errors. If you see errors, you can try using the "auto-fix" option to attempt to automagically fix these code style errors for you by running `npm run test:lint:fix`. _Note that not all the errors can be fixed using this method and you might need to fix the rest manually._ After fixing these errors, commit your changes.

Once you fixed any errors that showed up in the tests (if any), you are ready to open up your Pull Request. Here are some guidelines...

* Make the Pull Request against the ``master`` branch
* Give the Pull Request a descriptive title
  * Good - ``Fixing Remix Button Not Showing - Issue 1332``
  * Bad - ``Issue 1332``
* In the description
  * Describe the problem you are solving
  * Describe how the person reviewing your Pull Request can get your solution to work
* Include a ``Fixes #1332`` message in the  Pull Request description
  * When the Pull Request is merged, this automatically closes the associated issue
* Review the **Files Changed** tab in the Pull Request viewer to make sure only the changes you intended have made it in to the Pull Request
* Ping someone in a comment and ask for a Review

If you're submitting a Pull Request for a Bracket's related change, but the issue is filed in the Thimble repository you can reference it by replacing
``Fixes #1332`` to ``Fixes mozilla/thimble.mozilla.org#1332``. By default Github will try to reference an issue under the ID ``#1332`` if it exists within the
repository from which the Pull Request is being submitted. This works for all repositories, not just Brackets & Thimble.

### Check if your Pull Request is good to go

At the bottom of the  **Conversation** tab of the Pull Request page, there is a box that describes three different aspects of your Pull Request

* **Requested Changes**
  * This will indicate if other members of the team have requested any changes to the code you've made.
* **Travis Tests**
  * Travis is an automated system that checks your code to make sure it's valid.
  * If there are errors, click on the ``Details`` link and scroll through the Travis output to find the problem.
* **Merge conflicts**
  * Sometimes, if enough time has passed since you first created your branch, changes to the ``master`` branch may require you to rebase your branch to the latest master.

If any of the three above require you to make changes you **do not** need to make a new Pull Request. Simply make the changes in your local branch, re-test your code, and then push the changes up to your remote repository. Your new changes will automatically be reflected in your Pull Request.
