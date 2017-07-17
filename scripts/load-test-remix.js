/**
 * Simulate what Thimble does when a project is remixed. This is a simplification
 * of the code in public/editor/scripts/project/*.js, which loads a tarball,
 * project metadata, and sometimes a default HTML file.
 *
 * To use this run the following command:
 *
 * $ node ./scripts/load-test-remix.js --url https://thimble.mozilla.org -i 1238
 *
 * You can specify a different --url (or -u) for staging, local dev, or prod. It will
 * default to staging.  You must specify an --id (or -i) for the remix ID.
 */

"use strict";

let program = require("commander");
let prettyBytes = require("pretty-bytes");
let prettyMs = require("pretty-ms");
let request = require("request").defaults({
  headers: {
    "User-Agent": "Thimble Load Test"
  },
  time: true
});

program
  .description("A utility to simulate what Thimble does when a project is remixed")
  .option("-u, --url [url]", "Host URL", "https://bramble.mofostaging.net")
  .option("-i, --id <n>", "Remix Project ID")
  .parse(process.argv);

if(!program.url || !program.id) {
  program.help();
  return;
}

let host = program.url.replace(/\/$/, "");
let id = program.id;
let totalTimeMS = 0;

console.log("Running load test for host=%s and id=%s", host, id);

/**
 * 1) Load project tarball
 * GET arraybuffer {host}/projects/{id}/files/data?cacheBust={Date.now()}
 */
function step1() {
  console.log("Step 1: Loading project tarball");
  console.log("  Started");

  request.get({
    encoding: null,
    url: host + "/projects/" + id + "/files/data?cacheBust=" + Date.now()
  }, function(error, response, body) {
    if(error || response.statusCode !== 200) {
      console.log("  Failed. Got status code %s and error %s.", response.statusCode, error);
      process.exit(1);
    } else {
      totalTimeMS += response.elapsedTime;
      console.log("  Completed. Loaded %s in %s.", prettyBytes(body.length), prettyMs(response.elapsedTime));
      step2();
    }
  });
}

/**
 * 2) Load project metadata
 * GET JSON {host}/projects/{id}/files/meta?cacheBust={Date.now()}
 */
function step2() {
  console.log("Step 2: Loading project metadata");
  console.log("  Started");

  request.get({
    encoding: null,
    url: host + "/projects/" + id + "/files/meta?cacheBust=" + Date.now()
  }, function(error, response, body) {
    if(error || response.statusCode !== 200) {
      console.log("  Failed. Got status code %s and error %s.", response.statusCode, error);
      process.exit(1);
    } else {
      totalTimeMS += response.elapsedTime;
      console.log("  Completed. Loaded %s in %s.", prettyBytes(body.length), prettyMs(response.elapsedTime));
      step3();
    }
  });
}

/**
 * 3) Install a Default HTML if missing one in the project
 * GET {host}/default-files/html.txt
 */
function step3() {
  console.log("Step 3: Loading default HTML file");
  console.log("  Started");

  request.get({
    encoding: null,
    url: host + "/default-files/html.txt"
  }, function(error, response, body) {
    if(error || response.statusCode !== 200) {
      console.log("  Failed. Got status code %s and error %s.", response.statusCode, error);
      process.exit(1);
    } else {
      totalTimeMS += response.elapsedTime;
      console.log("  Completed. Loaded %s in %s.", prettyBytes(body.length), prettyMs(response.elapsedTime));

      console.log("Finished all steps in %s.", prettyMs(totalTimeMS));
      process.exit(0);
    }
  });
}

step1();
