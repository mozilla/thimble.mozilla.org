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
    dbAPI = db( "thimbleproject", dbConfig ),
    emailMap = {},
    processed = 0,
    updated = 0,
    limit = 50,
    lastpid = 0;

function getProjectEmailSet( callback ) {
  dbAPI.model.findAll({
    where: "email IS NOT NULL",
    group: "email",
    attributes: ["email"]
  }).success(function(hits) {
    async.eachLimit( hits, 5, function emailIterator( hit, callback ) {
      client.get.byEmail( hit.email, function( err, resp ) {
        if ( err ) {
          return callback( err );
        }
        if ( !resp || !resp.user ) {
          console.log( "no user account found for: " + hit.email + ".." );
          return callback();
        }
        emailMap[ hit.email ] = resp.user.id;
        callback();
      });
    }, function complete( err ) {
      if ( err ) {
        console.error( err );
        process.exit( 1 );
      }
      console.log( "Email - userid map generated, Fetching and updating projects...." );
      callback();
    })
  })
}

function setUserid( project, callback ) {
  lastpid = project.id;
  if ( !emailMap[ project.email ] ) {
    console.log("no account exists for project owner, skipping.");
    return callback();
  }

  project.userid = emailMap[ project.email ];
  project.save(["userid"]).error(callback).success(function() {
    updated++;
    console.log( project.id + " successfully updated with userid " + project.userid );
    callback();
  });
}

function getNextSet( callback ) {
  dbAPI.model.findAll({
    where: {
      id: {
        gt: lastpid
      },
      userid: null
    },
    limit: limit,
    order: "id ASC"
  }).complete(function( err, projects ) {
    async.eachSeries( projects, setUserid, callback );
  });
}

function migrate() {
  dbAPI.model.count({
    where: {
      userid: null
    }
  }).success(function( count ) {
    console.log( "Found " + count + " projects without userid..." );
    async.doWhilst( getNextSet, function() {
      processed += limit;
      if ( processed < count ) {
        return true
      }
      return false;
    }, function( err ) {
      if ( err ) {
        console.error( "Error: ", err );
      }
      console.log( updated + " Projects updated." );
      process.exit( 0 );
    });
  })
}

getProjectEmailSet( migrate );
