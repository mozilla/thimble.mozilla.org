/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports.generateLoginTokenForUser = function (modelsController) {
  return function (req, res, next) {
    modelsController.createToken(res.locals.user, req.body.appURL, !!req.body.migrateUser, function (err) {
      if (err) {
        if (err.error && err.error === "User not found") {
          return res.json(404, err);
        }
        return res.json(500, {
          "error": "login database error"
        });
      }
      res.json({
        "status": "Login Token Sent"
      });
    });
  };
};

module.exports.verifyTokenForUser = function (modelsController) {
  return function (req, res, next) {
    modelsController.lookupToken(res.locals.user, req.body.token, function (err) {
      if (err) {
        if (err.error && err.error === "unauthorized") {
          return res.json(401, {
            status: "unauthorized"
          });
        }
        return res.json(500, {
          "error": "Database Error"
        });
      }
      process.nextTick(next);
    });
  };
};

module.exports.updateUser = function (modelsController) {
  return function (req, res, next) {
    res.locals.user.updateAttributes({
      verified: true,
      lastLoggedIn: new Date()
    }, ["verified", "lastLoggedIn"]).done(function (err) {
      if (err) {
        return res.json({
          error: "Login database error"
        });
      }
      process.nextTick(next);
    });
  };
};

module.exports.setUser = function (modelsController) {
  var usernameRegex = /^[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\-]{1,20}$/;

  function getUIDType(uid) {
    if (usernameRegex.test(uid)) {
      return "username";
    }
    return "email";
  }

  return function (req, res, next) {
    var uid = req.body.uid;
    var lookup = getUIDType(uid);
    var where = {};

    if (!uid || !lookup) {
      return res.json(400, {
        "error": "Invalid Email or Username Provided"
      });
    }

    where[lookup] = uid;

    modelsController.user.find({
        where: where,
        include: [
          modelsController.password
        ]
      })
      .then(function (user) {
        if (!user) {
          return res.send(404);
        }
        res.locals.user = user;
        process.nextTick(next);
      })
      .error(function () {
        return res.json(500, {
          "error": "Error finding user"
        });
      });
  };
};

module.exports.resetPassword = function (modelsController) {
  return function (req, res, next) {
    var newPass = req.body.newPassword;
    var user = res.locals.user;

    modelsController.changePassword(newPass, user, function (err) {
      if (err) {
        console.error(err);
        return res.json(500, {
          error: "Error setting password"
        });
      }
      res.json({
        status: "success"
      });
    });
  };
};

module.exports.verifyResetCode = function (modelsController) {
  return function (req, res, next) {
    var code = req.body.resetCode;
    var user = res.locals.user;

    modelsController.validateReset(code, user, function (err, valid) {
      if (err || !valid) {
        return res.json(401, {
          "error": "unauthorized"
        });
      }
      process.nextTick(next);
    });
  };
};

module.exports.verifyPassword = function (modelsController) {
  return function (req, res, next) {
    var pass = req.body.password;
    var user = res.locals.user;

    if (!pass) {
      return res.json(401, {
        "error": "unauthorized"
      });
    }

    modelsController.compare(pass, user, function (err, result) {
      if (err || !result) {
        return res.json(401, {
          "error": "unauthorized"
        });
      }
      process.nextTick(next);
    });
  };
};

module.exports.doesUserHavePassword = function (expected) {
  return function (req, res, next) {
    if (res.locals.user.usePasswordLogin !== expected) {
      return res.json(401, {
        "error": "unauthorized"
      });
    }
    process.nextTick(next);
  };
};

module.exports.invalidateActiveResets = function (modelsController) {
  return function (req, res, next) {
    modelsController.invalidateActiveResets(res.locals.user, function (err) {
      if (err) {
        return res.json(500, {
          error: "Failed while updating active reset codes"
        });
      }
      process.nextTick(next);
    });
  };
};

module.exports.createResetCode = function (modelsController) {
  return function (req, res) {
    modelsController.createResetCode(res.locals.user, req.body.appURL, function (err) {
      if (err) {
        return res.json(500, {
          error: "Failed to create reset code"
        });
      }
      res.json({
        status: "created"
      });
    });
  };
};

module.exports.setPassword = function (modelsController) {
  return function (req, res, next) {
    if (!req.body.password) {
      return process.nextTick(next);
    }

    modelsController.changePassword(req.body.password, res.locals.user, function (err) {
      if (err) {
        console.error(err);
        return res.json(500, {
          error: "Error setting password"
        });
      }
      process.nextTick(next);
    });
  };
};

module.exports.removePassword = function (modelsController) {
  return function (req, res, next) {
    modelsController.removePassword(res.locals.user, function (err) {
      if (err) {
        console.error(err);
        return res.json(500, {
          error: "Error removing password"
        });
      }
      process.nextTick(next);
    });
  };
};

module.exports.outputUser = function (req, res) {
  return res.json(200, {
    exists: true,
    usePasswordLogin: res.locals.user.usePasswordLogin,
    verified: res.locals.user.verified
  });
};
