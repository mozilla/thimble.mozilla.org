module.exports = function (http, modelsController, webmakerAuth) {
  var qs = require("querystring"),
    express = require("express"),
    basicAuth = express.basicAuth,
    csrf = express.csrf(),
    env = require("../../config/environment"),
    routes = {
      site: require("./controllers/site"),
      user: require("./controllers/user")(modelsController),
      user2: require("./controllers/user2"),
      user3: require("./controllers/user3")
    },
    userList = env.get("ALLOWED_USERS"),
    authMiddleware = basicAuth(function (user, pass) {
      if (typeof userList === "string") {
        var arrList = {};
        var extractUserPass = function (pair) {
          var terms = pair.split(":");
          arrList[terms[0]] = terms[1];
        };
        userList.split(",").forEach(extractUserPass);
        userList = arrList;
      }
      var keys = Object.keys(userList);
      for (var k = 0; k < keys.length; k++) {
        var username = keys[k];
        if (user === username && pass === userList[username]) {
          return true;
        }
      }
      return false;
    }),
    allowedCorsDomains = env.get("ALLOWED_CORS_DOMAINS") ? env.get("ALLOWED_CORS_DOMAINS").split(" ") : [],
    cors = require("./cors")(allowedCorsDomains);

  if (env.get("ENABLE_RATE_LIMITING")) {
    require("./limiter")(http);
  }

  userList = qs.parse(userList, ",", ":");

  // Persona authentication (non-admin users)
  var checkPersona = function (req, res, next) {
    if (req.session.user) {
      req.params[0] = req.session.user.email;
      next();
    } else {
      res.send("You are not signed in :(");
    }
  };

  var filterAccountUpdates = function (req, res, next) {
    var filtered = {},
      input = req.body;

    // Only allow attributes that users should be able to set on their own account
    filtered.sendEventCreationEmails = input.sendEventCreationEmails;
    filtered.sendMentorRequestEmails = input.sendMentorRequestEmails;
    filtered.sendCoorganizerNotificationEmails = input.sendCoorganizerNotificationEmails;
    filtered.prefLocale = input.prefLocale;

    req.body = filtered;
    next();
  };

  /**
   * Routes declaration
   */

  // Static pages
  http.get("/", routes.site.index);

  // Account
  http.get("/account", csrf, routes.site.account);
  http.post("/account/delete", csrf, checkPersona, routes.user.del);
  http.put("/account/update", csrf, checkPersona, filterAccountUpdates, routes.user.update);

  // Resources
  http.get("/js/account.js", routes.site.js("account"));

  // Used by webmaker-user-client with basicAuth
  http.get("/user/id/*", authMiddleware, routes.user.getById);
  http.get("/user/username/*", authMiddleware, routes.user.getByUsername);
  http.get("/user/email/*", authMiddleware, routes.user.getByEmail);
  http.post("/user/ids", authMiddleware, routes.user.getByIds);
  http.post("/user/usernames", authMiddleware, routes.user.getByUsernames);
  http.post("/user/emails", authMiddleware, routes.user.getByEmails);
  http.put("/user/*", authMiddleware, routes.user.update);

  http.get("/usernames", authMiddleware, routes.user.hydrate);
  // Support for clients that refuse to send request bodies with POST requests
  http.post("/usernames", authMiddleware, routes.user.hydrate);

  // The new hotness
  var AUDIENCE_WHITELIST = env.get("ALLOWED_DOMAINS").split(" ");
  var middleware = require("./middleware");

  // Client-side Webmaker Auth support
  http.post("/verify", cors, webmakerAuth.handlers.verify);
  http.post("/authenticate", cors, webmakerAuth.handlers.authenticate);
  http.post("/logout", cors, webmakerAuth.handlers.logout);

  http.post("/auth/v2/create", cors, webmakerAuth.handlers.createUser);
  http.post("/auth/v2/uid-exists", cors, webmakerAuth.handlers.uidExists);
  http.post("/auth/v2/request", cors, webmakerAuth.handlers.request);
  http.post("/auth/v2/authenticateToken", cors, webmakerAuth.handlers.authenticateToken);
  http.post("/auth/v2/verify-password", cors, webmakerAuth.handlers.verifyPassword);
  http.post("/auth/v2/request-reset-code", cors, webmakerAuth.handlers.requestResetCode);
  http.post("/auth/v2/reset-password", cors, webmakerAuth.handlers.resetPassword);

  http.post("/auth/v2/enable-passwords", csrf, checkPersona, webmakerAuth.handlers.enablePasswords);
  http.post("/auth/v2/remove-password", csrf, checkPersona, webmakerAuth.handlers.removePassword);

  // Needed for all options requests via CORS
  http.options("/verify", cors);
  http.options("/authenticate", cors);
  http.options("/logout", cors);
  http.options("/create", cors);
  http.options("/check-username", cors);
  http.options("/auth/v2/create", cors);
  http.options("/auth/v2/uid-exists", cors);
  http.options("/auth/v2/request", cors);
  http.options("/auth/v2/authenticateToken", cors);
  http.options("/auth/v2/verify-password", cors);
  http.options("/auth/v2/request-reset-code", cors);
  http.options("/auth/v2/reset-password", cors);
  http.options("/auth/v2/enable-passwords", cors);
  http.options("/auth/v2/remove-password", cors);

  http.options("/auth/v2/create", cors);
  http.options("/auth/v2/uid-exists", cors);
  http.options("/auth/v2/request", cors);
  http.options("/auth/v2/authenticateToken", cors);
  http.options("/auth/v2/verify-password", cors);
  http.options("/auth/v2/request-reset-code", cors);
  http.options("/auth/v2/reset-password", cors);

  http.post("/auth/v2/enable-passwords", csrf, checkPersona, webmakerAuth.handlers.enablePasswords);
  http.post("/auth/v2/remove-password", csrf, checkPersona, webmakerAuth.handlers.removePassword);

  http.post(
    "/api/user/authenticate",
    middleware.personaFilter(AUDIENCE_WHITELIST),
    middleware.personaVerifier,
    routes.user2.authenticateUser(modelsController),
    middleware.updateUser(modelsController),
    middleware.filterUserAttributesForSession,
    routes.user2.outputUser
  );
  http.post(
    "/api/user/create",
    middleware.audienceFilter(AUDIENCE_WHITELIST),
    middleware.personaFilter(),
    middleware.personaVerifier,
    routes.user2.createUser(modelsController),
    middleware.filterUserAttributesForSession,
    routes.user2.outputUser
  );
  // For backwards compatibility; this can be removed at any time
  http.put(
    "/api/user/email/:email",
    authMiddleware,
    routes.user2.updateUserWithBody(modelsController),
    routes.user2.outputUser
  );
  http.patch(
    "/api/user/email/:email",
    authMiddleware,
    routes.user2.updateUserWithBody(modelsController),
    routes.user2.outputUser
  );
  http.patch(
    "/api/user/id/:id",
    authMiddleware,
    routes.user2.updateUserWithBody(modelsController),
    routes.user2.outputUser
  );
  http.patch(
    "/api/user/username/:username",
    authMiddleware,
    routes.user2.updateUserWithBody(modelsController),
    routes.user2.outputUser
  );
  http.post(
    "/api/user/exists",
    routes.user2.exists(modelsController)
  );
  http.post(
    "/api/v2/user/create",
    middleware.audienceFilter(AUDIENCE_WHITELIST),
    middleware.verifyPasswordStrength(true),
    routes.user2.createUser(modelsController),
    routes.user3.setPassword(modelsController),
    middleware.filterUserAttributesForSession,
    routes.user2.outputUser
  );
  http.post(
    "/api/v2/user/request",
    authMiddleware,
    routes.user3.setUser(modelsController),
    routes.user3.doesUserHavePassword(false),
    routes.user3.generateLoginTokenForUser(modelsController)
  );
  http.post(
    "/api/v2/user/authenticateToken",
    authMiddleware,
    routes.user3.setUser(modelsController),
    routes.user3.verifyTokenForUser(modelsController),
    routes.user3.updateUser(modelsController),
    middleware.filterUserAttributesForSession,
    routes.user2.outputUser
  );
  http.post(
    "/api/v2/user/verify-password",
    authMiddleware,
    routes.user3.setUser(modelsController),
    routes.user3.doesUserHavePassword(true),
    routes.user3.verifyPassword(modelsController),
    routes.user3.updateUser(modelsController),
    middleware.filterUserAttributesForSession,
    routes.user2.outputUser
  );
  http.post(
    "/api/v2/user/reset-password",
    authMiddleware,
    routes.user3.setUser(modelsController),
    middleware.verifyPasswordStrength(false),
    routes.user3.verifyResetCode(modelsController),
    routes.user3.resetPassword(modelsController)
  );
  http.post(
    "/api/v2/user/request-reset-code",
    authMiddleware,
    routes.user3.setUser(modelsController),
    routes.user3.invalidateActiveResets(modelsController),
    routes.user3.createResetCode(modelsController)
  );
  http.post(
    "/api/v2/user/enable-passwords",
    authMiddleware,
    routes.user3.setUser(modelsController),
    routes.user3.doesUserHavePassword(false),
    middleware.verifyPasswordStrength(false),
    routes.user3.setPassword(modelsController),
    middleware.filterUserAttributesForSession,
    routes.user2.outputUser
  );
  http.post(
    "/api/v2/user/remove-password",
    authMiddleware,
    routes.user3.setUser(modelsController),
    routes.user3.doesUserHavePassword(true),
    routes.user3.removePassword(modelsController),
    middleware.filterUserAttributesForSession,
    routes.user2.outputUser
  );
  http.post(
    "/api/v2/user/exists",
    authMiddleware,
    routes.user3.setUser(modelsController),
    routes.user3.outputUser
  );

  // Parameters
  http.param("email", middleware.fetchUserBy("Email", modelsController));
  http.param("id", middleware.fetchUserBy("Id", modelsController));
  http.param("username", middleware.fetchUserBy("Username", modelsController));

  // Devops
  http.get("/healthcheck", routes.site.healthcheck);
};
