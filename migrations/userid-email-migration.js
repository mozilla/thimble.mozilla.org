/**
 * This Script is designed to upgrade existing thimble projects
 * that are already in the MakeAPI. It will grab each makes id
 * and find it's corresponding Thimble project and update it
 * with that makes id.
 **/

var async = require( "async" ),
    habitat = require( "habitat" ),
    webmakerUserClient = require( "webmaker-user-client" ),
    env;

habitat.load();
env = new habitat();

    // Database information
var dbConfig = env.get( "DB" ),
    client = new webmakerUserClient({
      endpoint: env.get( "LOGIN_URL_AUTH" )
    }),
    db = require( "../lib/database" ),
    dbAPI = db( "thimbleproject", dbConfig );

var q = async.queue(function( task, callback ) {
  client.get.byEmail(task.email, function(err, res) {
    if (err) {
      return callback(err);
    }

    if (!res || !res.user) {
      console.log("No user found for email %s", task.email);
      return callback();
    }

    console.log("Set userid = %s where email = %s", res.user.id, task.email);
    dbAPI.model.update({
      userid: res.user.id
    }, {
      email: task.email
    }).then(function(affectedRows) {
      callback();
    });
  });
});

q.drain = function() {
  console.log( "migration complete!" );
};

dbAPI.model.findAll({
  where: {
    userid: null,
    email: {
      not: "NULL"
    }
  },
  group: "email",
  attributes: ["email"]
}, {
  raw: true
}).success(function(hits) {
  q.push(hits);
});
