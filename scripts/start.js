"use strict";

let runAll = require("npm-run-all");
let tasks = [ "server" ];
let options = {
  stdout: process.stdout,
  stderr: process.stderr
};

if(process.env.NODE_ENV === "production") {
  tasks.push("preclient");
} else {
  tasks.push("client");
  options.parallel = true;
}

return runAll(tasks, options);
