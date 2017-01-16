module.exports = function (app) {
  var env = require("../../config/environment");
  var url = require("url");

  if (!env.get("REDIS_URL")) {
    throw new Error("Rate limiting enabled, but no REDIS_URL is defined.");
  }

  var redisUrl = url.parse(env.get("REDIS_URL"));
  var redisConfig = {
    port: redisUrl.port,
    host: redisUrl.hostname,
    auth: redisUrl.auth.split(":")[1]
  };

  if (redisUrl.path) {
    redisConfig.db = redisUrl.path.substring(1);
  }

  var redisClient = require("redis").createClient(redisConfig.port, redisConfig.host);

  if (redisConfig.auth) {
    redisClient.auth(redisConfig.auth);
  }
  if (redisConfig.db) {
    redisClient.select(redisConfig.db);
  }

  var limiter = require("express-limiter")(app, redisClient);

  // key requests on the client IP and user uid
  var lookupKeys = ["headers.x-ratelimit-ip", "body.uid"];

  // Due to: https://github.com/ded/express-limiter/issues/3 you have to add 1
  // to the total requests you want to allow. upstream patch filed.

  limiter({
    // Throttle create-account requests to 250 per hour / IP
    path: "/api/v2/user/create",
    method: "post",
    lookup: "headers.x-ratelimit-ip",
    total: 251,
    expire: 1000 * 60 * 60
  });

  // Throttle OTP login requests to 1 per 10 seconds
  limiter({
    path: "/api/v2/user/request",
    method: "post",
    lookup: lookupKeys,
    total: 2,
    expire: 1000 * 10
  });

  // Throttle token authentication attempts to 10 per 10 seconds
  limiter({
    path: "/api/v2/user/authenticateToken",
    method: "post",
    lookup: lookupKeys,
    total: 11,
    expire: 1000 * 10
  });

  // Throttle password authentication attempts to 10 per 10 seconds
  limiter({
    path: "/api/v2/user/verify-password",
    method: "post",
    lookup: lookupKeys,
    total: 11,
    expire: 1000 * 10
  });

  // Throttle reset requests to one per hour
  limiter({
    path: "/api/v2/user/request-reset-code",
    method: "post",
    lookup: lookupKeys,
    total: 2,
    expire: 1000 * 60 * 60
  });

  // Throttle reset password attempts to 10 per 10 seconds
  limiter({
    path: "/api/v2/user/reset-password",
    method: "post",
    lookup: lookupKeys,
    total: 11,
    expire: 1000 * 10
  });
};
