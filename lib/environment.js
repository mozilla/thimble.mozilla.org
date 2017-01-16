"use strict";

/*
 * Initialize the environment for the server
*/

const Habitat = require(`habitat`);

// LOG_LEVEL set using the process env instead of .env
// This will always take precedence over what is set in the .env
const LOG_LEVEL = process.env.LOG_LEVEL;

if (process.env.NODE_ENV !== `test`) {
  Habitat.load(`.env`);
}

const defaults = {
  log_level: `info`,
  node_env: `development`
};
const env = new Habitat(`publish`, defaults);

if (LOG_LEVEL) {
  env.set(`LOG_LEVEL`, LOG_LEVEL);
}

module.exports = env;
