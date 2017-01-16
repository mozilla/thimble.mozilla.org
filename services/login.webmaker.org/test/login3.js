/* jshint mocha: true */

var Habitat = require("habitat"),
  assert = require("assert"),
  supertest = require("supertest"),
  appServer = require("../app/http/server"),
  db = require("../app/db"),
  env,
  modelControllers;

// use default env settings
Habitat.load("./env.sample");
env = new Habitat();

env.unset("DBOPTIONS_STORAGE");
env.set("DBOPTIONS_STORAGE", "logintest.sqlite");
env.set("HATCHET_NO_LOG");
env.set("DISABLE_HTTP_LOGGING");

modelControllers = db(env).Models;

var auth = env.get("ALLOWED_USERS").split(":"),
  authUsername = auth[0],
  authPassword = auth[1];

var server = appServer(env);

var testUser = {
  username: "webmaker",
  email: "webmaker@example.com"
};

describe("Login 3", function () {
  after(function (done) {
    server.close(function () {
      modelControllers.deleteUser(testUser.email, function (err) {
        assert.ifError(err);
        done();
      });
    });
  });

  describe("Create User", function () {
    it("Creates a new user", function (done) {
      supertest(server)
        .post("/api/v2/user/create")
        .type("application/json")
        .accept("application/json")
        .send({
          audience: "*",
          user: testUser
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert(res.body);
          assert(res.body.user);
          assert.equal(testUser.email, res.body.user.email);
          assert.equal(testUser.username, res.body.user.username);
          done();
        });
    });
  });

  describe("Create Token", function () {
    it("Can request a login token (using username)", function (done) {
      supertest(server)
        .post("/api/v2/user/request")
        .auth(authUsername, authPassword)
        .type("application/json")
        .accept("application/json")
        .send({
          uid: testUser.username,
          appURL: "https://webmaker.org"
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.ifError(res.body.error);
          assert.equal(res.body.status, "Login Token Sent");
          done();
        });
    });

    it("Can request a login token (using email)", function (done) {
      supertest(server)
        .post("/api/v2/user/request")
        .auth(authUsername, authPassword)
        .type("application/json")
        .accept("application/json")
        .send({
          uid: testUser.email,
          appURL: "https://webmaker.org"
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200)
        .end(function (err, res) {
          assert.ifError(err);
          assert.ifError(res.body.error);
          assert.equal(res.body.status, "Login Token Sent");
          done();
        });
    });

    it("Can't request a login token (using unknown username)", function (done) {
      supertest(server)
        .post("/api/v2/user/request")
        .auth(authUsername, authPassword)
        .type("application/json")
        .accept("text/plain")
        .send({
          uid: "fakeuser",
          appURL: "https://webmaker.org"
        })
        .expect("Content-Type", "text/plain")
        .expect(404)
        .end(done);
    });

    it("Can't request a login token (using unknown email)", function (done) {
      supertest(server)
        .post("/api/v2/user/request")
        .auth(authUsername, authPassword)
        .type("application/json")
        .accept("text/plain")
        .send({
          uid: "fakeuser@example.com",
          appURL: "https://webmaker.org"
        })
        .expect("Content-Type", "text/plain")
        .expect(404)
        .end(done);
    });
  });
});
