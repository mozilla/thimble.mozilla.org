"use strict";

let runAll = require("npm-run-all");
let env = require("../server/lib/environment");

let tasks = [ "localize-client:webpack" ];
let options = {
  stdout: process.stdout,
  stderr: process.stderr
};

return runAll(tasks, options)
.then(() => {
  let tasks = [ "server" ];

  if(env.get("NODE_ENV") === "development") {
    tasks.push("client");
    options.parallel = true;
  }

  return runAll(tasks, options);
})
.catch(console.error.bind(console));
