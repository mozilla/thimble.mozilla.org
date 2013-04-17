Thimble on Node.js
==================

In order to run Thimble on Node.js, the following things are required:

1) you will need to have node installed
2) you'll need to fork and then clone the repo recursively:

```
git clone git@github.com:[yourname]/ThimbleOnNode.git --recursive
```

3) you'll also need to clone the custom sanitization REST service that Thimble uses:

```
git clone git://github.com/Pomax/htmlsanitizer.org.git
```

4) go into the ThimbleOnNode dir and run ```npm install```

You are now ready to run the app, by first starting up the sanitizer in the
htmlsanitizer.org directory, by running ```python app.py```


You can then run Thimble from the ThimbleOnNode directory using ```node app```
or, if you want to run it in continuous mode, so that it auto-restarts when
files are updated, ```forever -w app```
