"use strict";

const throng = require("throng");
const thimble = require("./server");
const workers = process.env.WEB_CONCURRENCY || 1;

const start = function() {
  const server = thimble.listen(process.env.PORT);

  const shutdown = function() {
    server.close(function() {
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

throng(workers, start);
