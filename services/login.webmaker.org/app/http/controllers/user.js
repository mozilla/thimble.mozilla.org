/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var env = require("../../../config/environment"),
  metrics = require("../../../lib/metrics")(env);

module.exports = function (UserHandle) {
  function userCallback(err, user, query, res) {
    if (err) {
      metrics.increment("user.get.error");
      res.json(500, {
        error: err
      });
      return;
    }

    if (!user) {
      res.json(404, {
        error: err || "User not found for ID: " + query
      });
      return;
    }

    metrics.increment("user.get.success");
    res.json({
      user: user
    });
  }

  function usersCallback(err, users, type, res) {
    if (err) {
      metrics.increment("user.getBy" + type + ".error");
      res.json(500, {
        error: err
      });
      return;
    }

    metrics.increment("user.getBy" + type + ".success");
    res.json({
      users: users
    });
  }

  return {
    getById: function (req, res) {
      var id = req.params[0];
      UserHandle.getUserById(id, function (err, user) {
        userCallback(err, user, id, res);
      });
    },

    getByUsername: function (req, res) {
      var username = req.params[0];
      UserHandle.getUserByUsername(username, function (err, user) {
        userCallback(err, user, username, res);
      });
    },

    getByEmail: function (req, res) {
      var email = req.params[0];
      UserHandle.getUserByEmail(email, function (err, user) {
        userCallback(err, user, email, res);
      });
    },

    getByIds: function (req, res) {
      var ids = req.body.ids.filter(function (elem, pos, self) {
        return self.indexOf(elem) === pos;
      });
      UserHandle.getUsersByIds(ids, function (err, users) {
        usersCallback(err, users, "Ids", res);
      });
    },

    getByEmails: function (req, res) {
      var emails = req.body.emails.filter(function (elem, pos, self) {
        return self.indexOf(elem) === pos;
      });
      UserHandle.getUsersByEmails(emails, function (err, users) {
        usersCallback(err, users, "Emails", res);
      });
    },

    getByUsernames: function (req, res) {
      var usernames = req.body.usernames.filter(function (elem, pos, self) {
        return self.indexOf(elem) === pos;
      });
      UserHandle.getUsersByUsernames(usernames, function (err, users) {
        usersCallback(err, users, "Usernames", res);
      });
    },

    update: function (req, res) {
      var userInfo = req.body,
        email = req.params[0];

      UserHandle.updateUser(email, userInfo, function (err, user) {
        if (err || !user) {
          metrics.increment("user.update.error");
          return res.json(404, {
            error: err || "User not found for email: " + email
          });
        }
        if (req.session.user) {
          req.session.user = user;
        }
        return res.json(200, {
          user: user
        });
      });
    },

    del: function (req, res) {
      var email = req.params[0];

      // Confirm user exists (Sequelize happily deletes non-existent users)
      UserHandle.getUserByEmail(email, function (err, user) {
        if (err || !user) {
          metrics.increment("user.get.error");
          return res.json(404, {
            error: err || "User not found for email: " + email
          });
        }

        // Delete user
        UserHandle.deleteUser(email, function (err) {
          if (err) {
            metrics.increment("user.delete.error");
            res.json(500, {
              error: err
            });
            return;
          }

          metrics.increment("user.delete.success");
          res.json(200);
        });
      });
    },

    hydrate: function (req, res) {
      if (!req.body || !Array.isArray(req.body)) {
        return res.json(400, {
          error: "Invalid request body"
        });
      }

      // remove duplicate emails
      var emails = req.body.filter(function (elem, pos, self) {
        return self.indexOf(elem) === pos;
      });

      UserHandle.getAllWithEmails(emails, function (err, users) {
        if (err || !users) {
          return res.json(500, {
            error: "There was an error hydrating the data"
          });
        }

        var responseObject = {};

        users.forEach(function (user) {
          responseObject[user.email] = {
            username: user.username,
            emailHash: user.emailHash
          };
        });

        res.json(200, responseObject);
      });
    }
  };
}; // END Exports function
