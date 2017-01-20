require("habitat").load("tests.env");

var Code = require("code");
var Lab = require("lab");
var lab = exports.lab = Lab.script();

var loginServer = require("./mock-login/server");
var server = require("../web/server");
var testCreds = require("./testCredentials");
var url = require("url");

lab.experiment("OAuth", function() {
  var s = server({
    loginAPI: "http://localhost:3232",
    cookieSecret: "test",
    oauth_clients: testCreds.clients,
    authCodes: testCreds.authCodes,
    accessTokens: testCreds.accessTokens,
    enableCSRF: false
  });

  var s2 = server({
    loginAPI: "http://localhost:3232",
    cookieSecret: "test",
    oauth_clients: testCreds.clients,
    authCodes: testCreds.authCodes,
    accessTokens: testCreds.accessTokens,
    enableCSRF: true
  });

  var ls = loginServer({
    loginAPI: "http://localhost:3232"
  });

  lab.test("GET / Redirects to /signup", function(done) {
    var request = {
      method: "GET",
      url: "/"
    };

    s.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(302);
      Code.expect(response.headers.location).to.equal("/signup");
      done();
    });
  });

  lab.test("GET /signup returns 200, sets csrf cookie, and has security headers", function(done) {
    var request = {
      method: "GET",
      url: "/signup"
    };

    s2.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(200);
      Code.expect(response.headers["set-cookie"]).to.exist();
      Code.expect(response.headers["set-cookie"]).to.match(/crumb=/);

      Code.expect(response.headers["strict-transport-security"]).to.equal("max-age=15768000");
      Code.expect(response.headers["x-xss-protection"]).to.equal("1; mode=block");
      Code.expect(response.headers["x-frame-options"]).to.equal("DENY");
      Code.expect(response.headers["x-download-options"]).to.equal("noopen");
      Code.expect(response.headers["x-content-type-options"]).to.equal("nosniff");

      Code.expect(response.headers["content-security-policy"]).to.equal(
        "connect-src 'self';default-src 'none';font-src 'self' https://fonts.gstatic.com;" +
        "img-src 'self' data: https://www.google-analytics.com http://www.google-analytics.com;" +
        "script-src 'self' 'unsafe-eval' https://www.google-analytics.com http://www.google-analytics.com;" +
        "style-src 'self' https://fonts.googleapis.com"
      );

      done();
    });
  });

  lab.test("POST Create User", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/create-user",
        payload: {
          email: "webmaker@example.com",
          username: "webmaker",
          password: "CantGuessThis1234",
          feedback: true,
          client_id: "test",
          lang: "en-US"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.headers["set-cookie"]).to.exist();
        Code.expect(response.result.email).to.equal("webmaker@example.com");
        Code.expect(response.result.username).to.equal("webmaker");
        ls.stop(done);
      });
    });
  });

  lab.test("POST Create User - with CSRF Token Headers succeeds", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/create-user",
        headers: {
          "Cookie": "crumb=02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ",
          "X-CSRF-Token": "02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ"
        },
        payload: {
          email: "webmaker@example.com",
          username: "webmaker",
          password: "CantGuessThis123",
          feedback: true,
          client_id: "test",
          lang: "en-US"
        }
      };

      s2.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.headers["set-cookie"]).to.exist();
        Code.expect(response.result.email).to.equal("webmaker@example.com");
        Code.expect(response.result.username).to.equal("webmaker");
        ls.stop(done);
      });
    });
  });

  lab.test("POST Create User without lang attribute defaults to en-US", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/create-user",
        headers: {
          "Cookie": "crumb=02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ",
          "X-CSRF-Token": "02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ"
        },
        payload: {
          email: "webmaker@example.com",
          username: "webmaker",
          password: "CantGuessThis123",
          feedback: true,
          client_id: "test"
        }
      };

      s2.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.headers["set-cookie"]).to.exist();
        Code.expect(response.result.email).to.equal("webmaker@example.com");
        Code.expect(response.result.username).to.equal("webmaker");
        Code.expect(response.result.prefLocale).to.equal("en-US");
        ls.stop(done);
      });
    });
  });

  lab.test("POST Create User with lang attribute set", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/create-user",
        headers: {
          "Cookie": "crumb=02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ",
          "X-CSRF-Token": "02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ"
        },
        payload: {
          email: "webmaker@example.com",
          username: "webmaker",
          password: "CantGuessThis123",
          feedback: true,
          client_id: "test",
          lang: "it-CH"
        }
      };

      s2.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.headers["set-cookie"]).to.exist();
        Code.expect(response.result.email).to.equal("webmaker@example.com");
        Code.expect(response.result.username).to.equal("webmaker");
        Code.expect(response.result.prefLocale).to.equal("it-CH");
        ls.stop(done);
      });
    });
  });

  lab.test("POST Create User (invalid response)", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/create-user",
        payload: {
          email: "webmaker@example.com",
          username: "invalidResponse",
          password: "CantGuessThis1234",
          feedback: true,
          client_id: "test",
          lang: "en-US"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(500);
        ls.stop(done);
      });
    });
  });

  lab.test("POST Create User (login API failure)", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/create-user",
        payload: {
          email: "webmaker@example.com",
          username: "notgonnawork",
          password: "CantGuessThis1234",
          feedback: true,
          client_id: "test",
          lang: "en-US"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(500);
        ls.stop(done);
      });
    });
  });

  lab.test(
    "POST Create User returns 400 if the user provides a weak password",
    function(done) {
      ls.start(function(error) {
        Code.expect(error).to.be.undefined();
        var request = {
          method: "POST",
          url: "/create-user",
          payload: {
            email: "webmaker@example.com",
            username: "weakpass",
            password: "password",
            feedback: true,
            client_id: "test",
            lang: "en-US"
          }
        };

        s.inject(request, function(response) {
          Code.expect(response.statusCode).to.equal(400);
          Code.expect(response.result.message).to.equal("Password not strong enough.");
          ls.stop(done);
        });
      });
    }
  );

  lab.test(
    "POST Create User returns 400 if no email param provided",
    function(done) {
      ls.start(function(error) {
        Code.expect(error).to.be.undefined();
        var request = {
          method: "POST",
          url: "/create-user",
          payload: {
            username: "webmaker",
            password: "CantGuessThis",
            feedback: true,
            client_id: "test",
            lang: "en-US"
          }
        };

        s.inject(request, function(response) {
          Code.expect(response.statusCode).to.equal(400);
          ls.stop(done);
        });
      });
    }
  );

  lab.test(
    "POST Create User returns 400 if no username param provided",
    function(done) {
      ls.start(function(error) {
        Code.expect(error).to.be.undefined();
        var request = {
          method: "POST",
          url: "/create-user",
          payload: {
            email: "webmaker@example.com",
            password: "CantGuessThis",
            feedback: true,
            client_id: "test",
            lang: "en-US"
          }
        };

        s.inject(request, function(response) {
          Code.expect(response.statusCode).to.equal(400);
          ls.stop(done);
        });
      });
    }
  );

  lab.test(
    "POST Create User returns 400 if no password param provided",
    function(done) {
      ls.start(function(error) {
        Code.expect(error).to.be.undefined();
        var request = {
          method: "POST",
          url: "/create-user",
          payload: {
            email: "webmaker@example.com",
            username: "webmaker",
            feedback: true,
            client_id: "test",
            lang: "en-US"
          }
        };

        s.inject(request, function(response) {
          Code.expect(response.statusCode).to.equal(400);
          ls.stop(done);
        });
      });
    }
  );

  lab.test(
    "POST Create User returns 400 if no feedback param provided",
    function(done) {
      ls.start(function(error) {
        Code.expect(error).to.be.undefined();
        var request = {
          method: "POST",
          url: "/create-user",
          payload: {
            email: "webmaker@example.com",
            username: "webmaker",
            password: "CantGuessThis",
            client_id: "test",
            lang: "en-US"
          }
        };

        s.inject(request, function(response) {
          Code.expect(response.statusCode).to.equal(400);
          ls.stop(done);
        });
      });
    }
  );

  lab.test("POST Request Reset", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/request-reset",
        payload: {
          uid: "webmaker"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.status).to.equal("created");
        ls.stop(done);
      });
    });
  });

  lab.test("POST Request Reset - with CSRF Token Headers succeeds", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/request-reset",
        headers: {
          "Cookie": "crumb=02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ",
          "X-CSRF-Token": "02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ"
        },
        payload: {
          uid: "webmaker"
        }
      };

      s2.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.status).to.equal("created");
        ls.stop(done);
      });
    });
  });

  lab.test("POST Request Reset - without CSRF Token Headers returns 403", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/request-reset",
        payload: {
          uid: "webmaker"
        }
      };

      s2.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(403);
        ls.stop(done);
      });
    });
  });

  lab.test("POST Request Reset (failure)", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/request-reset",
        payload: {
          uid: "fail"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(500);
        ls.stop(done);
      });
    });
  });

  lab.test("POST Request Reset (invalid response)", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/request-reset",
        payload: {
          uid: "invalidResponse"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(500);
        ls.stop(done);
      });
    });
  });

  lab.test("POST Reset Password", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/reset-password",
        payload: {
          uid: "webmaker",
          resetCode: "resetCode",
          password: "UnguessablePassword"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.status).to.equal("success");
        ls.stop(done);
      });
    });
  });

  lab.test("POST Reset Password - With CSRF Token Headers succeeds", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/reset-password",
        headers: {
          "Cookie": "crumb=02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ",
          "X-CSRF-Token": "02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ"
        },
        payload: {
          uid: "webmaker",
          resetCode: "resetCode",
          password: "UnguessablePassword"
        }
      };

      s2.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.status).to.equal("success");
        ls.stop(done);
      });
    });
  });

  lab.test("POST Reset Password - Without CSRF Token Headers returns 403", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/reset-password",
        payload: {
          uid: "webmaker",
          resetCode: "resetCode",
          password: "UnguessablePassword"
        }
      };

      s2.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(403);
        ls.stop(done);
      });
    });
  });

  lab.test("POST Reset Password (bad code)", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/reset-password",
        payload: {
          uid: "webmaker",
          resetCode: "invalid",
          password: "UnguessablePassword"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(401);
        Code.expect(response.result.error).to.equal("Unauthorized");
        ls.stop(done);
      });
    });
  });

  lab.test("POST Reset Password (bad request)", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/reset-password",
        payload: {
          uid: "badRequest",
          resetCode: "resetCode",
          password: "UnguessablePassword"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.result.error).to.equal("Bad Request");
        ls.stop(done);
      });
    });
  });

  lab.test("POST Reset Password (invalid response)", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/reset-password",
        payload: {
          uid: "invalidResponse",
          resetCode: "resetCode",
          password: "UnguessablePassword"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(500);
        ls.stop(done);
      });
    });
  });

  lab.test("POST login", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/login",
        payload: {
          uid: "webmaker",
          password: "password"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.headers["set-cookie"]).to.exist();
        ls.stop(done);
      });
    });
  });

  lab.test("POST login - With CSRF Token Headers succeeds", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/login",
        headers: {
          "Cookie": "crumb=02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ",
          "X-CSRF-Token": "02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ"
        },
        payload: {
          uid: "webmaker",
          password: "password"
        }
      };

      s2.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.headers["set-cookie"]).to.exist();
        ls.stop(done);
      });
    });
  });

  lab.test("POST login - without CSRF Token headers returns 403", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/login",
        payload: {
          uid: "webmaker",
          password: "password"
        }
      };

      s2.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(403);
        ls.stop(done);
      });
    });
  });

  lab.test("POST login - x-forwarded-for", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/login",
        headers: {
          "x-forwarded-for": "192.168.1.1"
        },
        payload: {
          uid: "webmaker",
          password: "password"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.headers["set-cookie"]).to.exist();
        ls.stop(done);
      });
    });
  });

  lab.test("POST login - invalid json response", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/login",
        payload: {
          uid: "invalidResponse",
          password: "password"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(500);
        Code.expect(response.headers["set-cookie"]).to.be.undefined();
        ls.stop(done);
      });
    });
  });

  lab.test("POST login - unauthorized", function(done) {
    ls.start(function(error) {
      Code.expect(error).to.be.undefined();
      var request = {
        method: "POST",
        url: "/login",
        payload: {
          uid: "webmaker",
          password: "fake"
        }
      };

      s.inject(request, function(response) {
        Code.expect(response.statusCode).to.equal(401);
        Code.expect(response.headers["set-cookie"]).to.be.undefined();
        ls.stop(done);
      });
    });
  });

  lab.test("GET logout", function(done) {
    var request = {
      method: "GET",
      url: "/logout?client_id=test",
      credentials: {
        uid: "webmaker"
      }
    };

    s.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(302);
      Code.expect(response.headers["set-cookie"][0]).to.equal(
        "webmaker=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; Path=/"
      );

      Code.expect(response.headers.location).to.exist();
      Code.expect(response.headers["cache-control"]).to.equal("no-cache");

      var redirectUri = url.parse(response.headers.location, true);

      Code.expect(redirectUri.protocol).to.equal("http:");
      Code.expect(redirectUri.host).to.equal("example.org");
      Code.expect(redirectUri.pathname).to.equal("/oauth_redirect");
      Code.expect(redirectUri.query.logout).to.equal("true");

      ls.stop(done);
    });
  });

  lab.test("GET logout - no client_id", function(done) {
    var request = {
      method: "GET",
      url: "/logout",
      credentials: {
        uid: "webmaker"
      }
    };

    s.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(302);
      Code.expect(response.headers["set-cookie"][0]).to.equal(
        "webmaker=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; Path=/"
      );

      Code.expect(response.headers.location).to.exist();

      var redirectUri = url.parse(response.headers.location, true);

      Code.expect(redirectUri.protocol).to.equal("https:");
      Code.expect(redirectUri.host).to.equal("webmaker.org");
      Code.expect(redirectUri.query.logout).to.equal("true");

      ls.stop(done);
    });
  });

  lab.test("GET logout - invalid client_id", function(done) {
    var request = {
      method: "GET",
      url: "/logout?client_id=fake",
      credentials: {
        uid: "webmaker"
      }
    };

    s.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(400);
      ls.stop(done);
    });
  });

  lab.test("GET authorize (response_type=code)", function(done) {
    var request = {
      method: "GET",
      url: "/login/oauth/authorize?client_id=test&scopes=user email&state=test&response_type=code",
      credentials: {
        username: "webmaker",
        id: 1,
        email: "webmaker@example.org"
      }
    };

    s.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(302);
      Code.expect(response.headers.location).to.exist();

      var redirectUri = url.parse(response.headers.location, true);

      Code.expect(redirectUri.protocol).to.equal("http:");
      Code.expect(redirectUri.host).to.equal("example.org");
      Code.expect(redirectUri.pathname).to.equal("/oauth_redirect");
      Code.expect(redirectUri.query.code).to.be.a.string();
      Code.expect(redirectUri.query.state).to.equal("test");
      Code.expect(redirectUri.query.client_id).to.equal("test");

      done();
    });
  });

  lab.test("GET authorize (response_type=token)", function(done) {
    var request = {
      method: "GET",
      url: "/login/oauth/authorize?client_id=test&scopes=user email&response_type=token&state=test",
      credentials: {
        username: "webmaker",
        id: 1,
        email: "webmaker@example.org"
      }
    };

    s.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(302);
      Code.expect(response.headers.location).to.exist();

      var redirectUri = url.parse(response.headers.location, true);

      Code.expect(redirectUri.protocol).to.equal("http:");
      Code.expect(redirectUri.host).to.equal("example.org");
      Code.expect(redirectUri.pathname).to.equal("/oauth_redirect");
      Code.expect(redirectUri.hash).to.startWith("#token=");

      done();
    });
  });

  lab.test("GET authorize (response_type=token), client not allowed to use", function(done) {
    var request = {
      method: "GET",
      url: "/login/oauth/authorize?client_id=test2&scopes=user email&state=test&response_type=token",
      credentials: {
        username: "webmaker",
        id: 1,
        email: "webmaker@example.org"
      }
    };

    s.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(403);

      done();
    });
  });

  lab.test("GET authorize (response_type=code), client not allowed to use", function(done) {
    var request = {
      method: "GET",
      url: "/login/oauth/authorize?client_id=test3&scopes=user email&state=test&response_type=code",
      credentials: {
        username: "webmaker",
        id: 1,
        email: "webmaker@example.org"
      }
    };

    s.inject(request, function(response) {
      console.log(response.result);
      Code.expect(response.statusCode).to.equal(403);

      done();
    });
  });

  lab.test("GET authorize - no session", function(done) {
    var request = {
      method: "GET",
      url: "/login/oauth/authorize?client_id=test&scopes=user&state=test&response_type=code"
    };

    s.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(302);
      Code.expect(response.headers.location).to.exist();

      var redirectUri = url.parse(response.headers.location, true);

      Code.expect(redirectUri.pathname).to.equal("/login");
      Code.expect(redirectUri.query.client_id).to.equal("test");
      Code.expect(redirectUri.query.scopes).to.equal("user");
      Code.expect(redirectUri.query.state).to.equal("test");
      Code.expect(redirectUri.query.response_type).to.equal("code");

      done();
    });
  });

  lab.test("GET authorize - no session, signup action", function(done) {
    var request = {
      method: "GET",
      url: "/login/oauth/authorize?client_id=test&scopes=user&state=test&response_type=code&action=signup",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    };

    s.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(302);
      Code.expect(response.headers.location).to.exist();

      var redirectUri = url.parse(response.headers.location, true);

      Code.expect(redirectUri.pathname).to.equal("/signup");
      Code.expect(redirectUri.query.client_id).to.equal("test");
      Code.expect(redirectUri.query.scopes).to.equal("user");
      Code.expect(redirectUri.query.state).to.equal("test");
      Code.expect(redirectUri.query.response_type).to.equal("code");

      done();
    });
  });

  lab.test("GET authorize - invalid client_id", function(done) {
    var request = {
      method: "GET",
      url: "/login/oauth/authorize?client_id=invalid&response_type=code&scopes=user&state=test",
      credentials: {
        username: "webmaker",
        email: "webmaker@example.org"
      }
    };

    s.inject(request, function(response) {
      Code.expect(response.statusCode).to.equal(400);
      Code.expect(response.result.message).to.equal("invalid client_id");

      done();
    });
  });

  lab.test("POST access_token", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "client_id=test&client_secret=test&grant_type=authorization_code&code=test",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.access_token).to.be.a.string();
        Code.expect(response.result.scopes).to.contain("user");
        Code.expect(response.result.token_type).to.equal("token");
        done();
      });
    });
  });

  lab.test("POST access_token - Without CSRF Token succeeds", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "client_id=test&client_secret=test&grant_type=authorization_code&code=test2",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s2.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.access_token).to.be.a.string();
        Code.expect(response.result.scopes).to.contain("user");
        Code.expect(response.result.token_type).to.equal("token");
        done();
      });
    });
  });

  lab.test("POST access_token - unknown client_id", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "client_id=fake&client_secret=test&grant_type=authorization_code&code=test",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        done();
      });
    });
  });

  lab.test("POST access_token - mismatched client_id", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "client_id=test&client_secret=test&grant_type=authorization_code&code=mismatched",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(403);
        done();
      });
    });
  });

  lab.test("POST access_token - invalid client_secret", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "client_id=test&client_secret=fake&grant_type=authorization_code&code=test",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(403);
        done();
      });
    });
  });

  lab.test("POST access_token - invalid auth code", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "client_id=test&client_secret=test&code=fake&grant_type=authorization_code",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(403);
        done();
      });
    });
  });

  lab.test("POST access_token - invalid client id", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "client_id=test2&client_secret=test2&grant_type=authorization_code&code=test2",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(403);
        done();
      });
    });
  });

  lab.test("POST access_token - invalid grant_type", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "client_id=test&client_secret=test&grant_type=client_credentials&code=test",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.result).to.exist();
        Code.expect(response.result.message).to.equal("invalid payload: grant_type");
        done();
      });
    });
  });

  lab.test("POST access_token - missing client_id", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "client_secret=test&grant_type=authorization_code&code=test",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.result.message).to.equal("invalid payload: client_id");
        done();
      });
    });
  });

  lab.test("POST access_token - missing client_secret", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "client_id=test&grant_type=authorization_code&code=test",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.result.message).to.equal("invalid payload: client_secret");
        done();
      });
    });
  });

  lab.test("POST access_token - missing grant_type", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "client_id=test&client_secret=test&code=test",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.result.message).to.equal("invalid payload: grant_type");
        done();
      });
    });
  });

  lab.test("POST access_token, password grant", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "uid=webmaker&password=password&scopes=user%20projects&grant_type=password&client_id=test",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.access_token).to.be.a.string();
        Code.expect(response.result.scopes).to.contain("user", "projects");
        Code.expect(response.result.token_type).to.equal("token");
        done();
      });
    });
  });

  lab.test("POST access_token, password grant fails with invalid credentials", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "uid=fail&password=password&scopes=user%20projects&grant_type=password&client_id=test",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });
    });
  });

  lab.test("POST access_token, password grant fails with invalid client_id", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "uid=webmaker&password=password&scopes=user%20projects&grant_type=password&client_id=fake123",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.result.message).to.equal("invalid client_id");
        done();
      });
    });
  });

  lab.test("POST access_token - no code with password grant", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "uid=webmaker&password=password&scopes=user&client_id=test&code=test&grant_type=password",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.result.message).to.equal("invalid payload: code");
        done();
      });
    });
  });

  lab.test("POST access_token - no client_secret with password grant", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "uid=webmaker&password=password&scopes=user&client_id=test&client_secret=test&grant_type=password",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.result.message).to.equal("invalid payload: client_secret");
        done();
      });
    });
  });

  lab.test("POST access_token - uid required with password grant", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "password=password&scopes=user&client_id=test&grant_type=password",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.result.message).to.equal("invalid payload: uid");
        done();
      });
    });
  });

  lab.test("POST access_token - password required with password grant", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "uid=webmaker&scopes=user&client_id=test&grant_type=password",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.result.message).to.equal("invalid payload: password");
        done();
      });
    });
  });

  lab.test("POST access_token - no uid with authorization_code grant", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "uid=webmaker&client_id=test&client_secret=test&code=test&grant_type=authorization_code",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.result.message).to.equal("invalid payload: uid");
        done();
      });
    });
  });

  lab.test("POST access_token - no password with authorization_code grant", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "password=password&scopes=user&client_id=test&" +
          "client_secret=test&code=test&grant_type=authorization_code",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.result.message).to.equal("invalid payload: password");
        done();
      });
    });
  });

  lab.test("POST access_token - no scope with authorization_code grant", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "scopes=user&client_id=test&client_secret=test&code=test&grant_type=authorization_code",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.result.message).to.equal("invalid payload: scopes");
        done();
      });
    });
  });

  lab.test("POST access_token - no uid with authorization_code grant", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "uid=webmaker&password=password&scopes=user&client_id=test&code=test&grant_type=authorization_code",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        Code.expect(response.result.message).to.equal("invalid payload: client_secret");
        done();
      });
    });
  });

  lab.test("POST access_token - client not allowed password grant", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "uid=webmaker&password=password&scopes=user&client_id=test2&grant_type=password",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(403);
        Code.expect(response.result.message).to.equal("Invalid Client Credentials");
        done();
      });
    });
  });

  lab.test("POST access_token - client not allowed authorization_code grant", function(done) {
    ls.start(function(error) {
      var accessTokenRequest = {
        method: "POST",
        url: "/login/oauth/access_token",
        payload: "code=test&client_id=test3&client_secret=test3&grant_type=authorization_code",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      };

      s.inject(accessTokenRequest, function(response) {
        Code.expect(response.statusCode).to.equal(403);
        Code.expect(response.result.message).to.equal("Invalid Client Credentials");
        done();
      });
    });
  });

  lab.test("GET /user", function(done) {
    ls.start(function(error) {
      var getUserRequest = {
        method: "GET",
        url: "/user",
        headers: {
          "authorization": "token testAccessToken"
        }
      };

      s.inject(getUserRequest, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.username).to.equal("test");
        Code.expect(response.result.email).to.equal("test@example.com");
        Code.expect(response.result.scope).to.include(["user", "email"]);
        done();
      });
    });
  });

  lab.test("GET /user works with additional scopes set on token", function(done) {
    ls.start(function(error) {
      var getUserRequest = {
        method: "GET",
        url: "/user",
        headers: {
          "authorization": "token testAccessToken2"
        }
      };

      s.inject(getUserRequest, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.username).to.equal("test");
        Code.expect(response.result.email).to.equal("test@example.com");
        Code.expect(response.result.scope).to.include(["user", "email", "foo"]);
        done();
      });
    });
  });

  lab.test("GET /user returns 401 with malformed Authorization header", function(done) {
    ls.start(function(error) {
      var getUserRequest = {
        method: "GET",
        url: "/user",
        headers: {
          "authorization": "basic nonsenseauthheader"
        }
      };

      s.inject(getUserRequest, function(response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });
    });
  });

  lab.test("GET /user returns 401 with malformed Authorization header", function(done) {
    ls.start(function(error) {
      var getUserRequest = {
        method: "GET",
        url: "/user",
        headers: {
          "authorization": "token"
        }
      };

      s.inject(getUserRequest, function(response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });
    });
  });

  lab.test("GET /user returns 401 with invalid access token", function(done) {
    ls.start(function(error) {
      var getUserRequest = {
        method: "GET",
        url: "/user",
        headers: {
          "authorization": "token fakeToken"
        }
      };

      s.inject(getUserRequest, function(response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });
    });
  });

  lab.test("GET /user returns 401 with expired access token", function(done) {
    ls.start(function(error) {
      var getUserRequest = {
        method: "GET",
        url: "/user",
        headers: {
          "authorization": "token expiredAccessToken"
        }
      };

      s.inject(getUserRequest, function(response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });
    });
  });

  lab.test("GET /user returns 401 with no authorization header", function(done) {
    ls.start(function(error) {
      var getUserRequest = {
        method: "GET",
        url: "/user"
      };

      s.inject(getUserRequest, function(response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });
    });
  });

  lab.test("GET /user returns 401 when token has insufficient scope", function(done) {
    ls.start(function(error) {
      var getUserRequest = {
        method: "GET",
        url: "/user",
        headers: {
          "authorization": "token invalidScope"
        }
      };

      s.inject(getUserRequest, function(response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });
    });
  });

  lab.test("GET /user returns 500 when loginAPI fails", function(done) {
    ls.start(function(error) {
      var getUserRequest = {
        method: "GET",
        url: "/user",
        headers: {
          "authorization": "token getUserFail"
        }
      };

      s.inject(getUserRequest, function(response) {
        Code.expect(response.statusCode).to.equal(500);
        done();
      });
    });
  });

  lab.test("POST /request-migration-email succeeds", function(done) {
    ls.start(function(error) {
      var migrationEmailRequest = {
        method: "POST",
        url: "/request-migration-email",
        payload: {
          uid: "test",
          oauth: {
            oauthy: "params"
          }
        }
      };

      s.inject(migrationEmailRequest, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        done();
      });
    });
  });

  lab.test("POST /request-migration-email with CSRF Token Headers succeeds", function(done) {
    ls.start(function(error) {
      var migrationEmailRequest = {
        method: "POST",
        url: "/request-migration-email",
        headers: {
          "Cookie": "crumb=02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ",
          "X-CSRF-Token": "02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ"
        },
        payload: {
          uid: "test",
          oauth: {
            oauthy: "params"
          }
        }
      };

      s2.inject(migrationEmailRequest, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        done();
      });
    });
  });

  lab.test("POST /request-migration-email Without CSRF Token Headers returns 403", function(done) {
    ls.start(function(error) {
      var migrationEmailRequest = {
        method: "POST",
        url: "/request-migration-email",
        payload: {
          uid: "test",
          oauth: {
            oauthy: "params"
          }
        }
      };

      s2.inject(migrationEmailRequest, function(response) {
        Code.expect(response.statusCode).to.equal(403);
        done();
      });
    });
  });

  lab.test("POST /request-migration-email fails if user not found on loginapi", function(done) {
    ls.start(function(error) {
      var migrationEmailRequest = {
        method: "POST",
        url: "/request-migration-email",
        payload: {
          uid: "fakeuser",
          oauth: {
            oauthy: "params"
          }
        }
      };

      s.inject(migrationEmailRequest, function(response) {
        Code.expect(response.statusCode).to.equal(500);
        done();
      });
    });
  });

  lab.test("POST /migrate-user", function(done) {
    ls.start(function(error) {
      var migrateUserRequest = {
        method: "POST",
        url: "/migrate-user",
        payload: {
          uid: "test",
          token: "kakav-nufuk",
          password: "Super-Duper-Strong-Passphrase-9001"
        }
      };

      s.inject(migrateUserRequest, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        done();
      });
    });
  });

  lab.test("POST /migrate-user - With CSRF Token Headers succeeds", function(done) {
    ls.start(function(error) {
      var migrateUserRequest = {
        method: "POST",
        url: "/migrate-user",
        headers: {
          "Cookie": "crumb=02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ",
          "X-CSRF-Token": "02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ"
        },
        payload: {
          uid: "test",
          token: "kakav-nufuk",
          password: "Super-Duper-Strong-Passphrase-9001"
        }
      };

      s2.inject(migrateUserRequest, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        done();
      });
    });
  });

  lab.test("POST /migrate-user - Without CSRF Token Headers returns 403", function(done) {
    ls.start(function(error) {
      var migrateUserRequest = {
        method: "POST",
        url: "/migrate-user",
        payload: {
          uid: "test",
          token: "kakav-nufuk",
          password: "Super-Duper-Strong-Passphrase-9001"
        }
      };

      s2.inject(migrateUserRequest, function(response) {
        Code.expect(response.statusCode).to.equal(403);
        done();
      });
    });
  });

  lab.test("POST /migrate-user returns 401 if using invalid username", function(done) {
    ls.start(function(error) {
      var migrateUserRequest = {
        method: "POST",
        url: "/migrate-user",
        payload: {
          uid: "fake",
          token: "kakav-nufuk",
          password: "Super-Duper-Strong-Passphrase-9001"
        }
      };

      s.inject(migrateUserRequest, function(response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });
    });
  });

  lab.test("POST /migrate-user returns 401 if using bad token", function(done) {
    ls.start(function(error) {
      var migrateUserRequest = {
        method: "POST",
        url: "/migrate-user",
        payload: {
          uid: "test",
          token: "nufuk-kakav",
          password: "Super-Duper-Strong-Passphrase-9001"
        }
      };

      s.inject(migrateUserRequest, function(response) {
        Code.expect(response.statusCode).to.equal(401);
        done();
      });
    });
  });

  lab.test("POST /migrate-user returns 400 if sent no password", function(done) {
    ls.start(function(error) {
      var migrateUserRequest = {
        method: "POST",
        url: "/migrate-user",
        payload: {
          uid: "test",
          token: "nufuk-kakav"
        }
      };

      s.inject(migrateUserRequest, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        done();
      });
    });
  });

  lab.test("POST /migrate-user returns 400 if sent a weak password", function(done) {
    ls.start(function(error) {
      var migrateUserRequest = {
        method: "POST",
        url: "/migrate-user",
        payload: {
          uid: "test",
          token: "nufuk-kakav",
          password: "password"
        }
      };

      s.inject(migrateUserRequest, function(response) {
        Code.expect(response.statusCode).to.equal(400);
        done();
      });
    });
  });

  lab.test("POST /migrate-user returns 500 if set password fails on login", function(done) {
    ls.start(function(error) {
      var migrateUserRequest = {
        method: "POST",
        url: "/migrate-user",
        payload: {
          uid: "test",
          token: "kakav-nufuk",
          password: "Super-Duper-Strong-Passphrase-9002"
        }
      };

      s.inject(migrateUserRequest, function(response) {
        Code.expect(response.statusCode).to.equal(500);
        done();
      });
    });
  });

  lab.test("POST /check-username returns 200, exists & usePasswordLogin true", function(done) {
    ls.start(function(error) {
      var checkUsernameRequest = {
        method: "POST",
        url: "/check-username",
        payload: {
          uid: "test"
        }
      };

      s.inject(checkUsernameRequest, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.exists).to.equal(true);
        Code.expect(response.result.usePasswordLogin).to.equal(true);
        done();
      });
    });
  });

  lab.test("POST /check-username - With CSRF Token Headers succeeds", function(done) {
    ls.start(function(error) {
      var checkUsernameRequest = {
        method: "POST",
        url: "/check-username",
        headers: {
          "Cookie": "crumb=02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ",
          "X-CSRF-Token": "02mke0occKoOiqFkr9MUYo9YnMellJE_0dPD6UowyeJ"
        },
        payload: {
          uid: "test"
        }
      };

      s2.inject(checkUsernameRequest, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.exists).to.equal(true);
        Code.expect(response.result.usePasswordLogin).to.equal(true);
        done();
      });
    });
  });

  lab.test("POST /check-username - Without CSRF Token Headers returns 403", function(done) {
    ls.start(function(error) {
      var checkUsernameRequest = {
        method: "POST",
        url: "/check-username",
        payload: {
          uid: "test"
        }
      };

      s2.inject(checkUsernameRequest, function(response) {
        Code.expect(response.statusCode).to.equal(403);
        done();
      });
    });
  });


  lab.test("POST /check-username returns 404 for non-existent user", function(done) {
    ls.start(function(error) {
      var checkUsernameRequest = {
        method: "POST",
        url: "/check-username",
        payload: {
          uid: "nobody"
        }
      };

      s.inject(checkUsernameRequest, function(response) {
        Code.expect(response.statusCode).to.equal(404);
        done();
      });
    });
  });
});
