var env = require("./server/lib/environment");

module.exports = {
  DEFAULT_PROJECT_NAME: env.get("DEFAULT_PROJECT_NAME")
};
