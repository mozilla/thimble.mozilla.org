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
    completed = 0,
    skipped = 0,
    q;

function processThimbleProject( project, callback ) {
  client.get.byEmail( project.email, function( err, resp ) {
    if ( err ) {
      return callback( err );
    }
    if ( !resp || !resp.user ) {
      console.log( "no user account found for: " + project.email + ", skipping" );
      skipped++;
      return callback();
    }
    project.userid = resp.user.id;
    project.save().error(function( error ) {
      callback( err );
    }).success(function() {
      completed++;
      callback();
    });
  });
}

q = async.queue( processThimbleProject, 5 );

q.drain = function() {
  console.log( completed + " projects updated successfully.\n" + skipped + " projects skipped (no existing webmaker account for project)." );
  process.exit( 0 );
};

console.log( "Fetching all projects... This could take some time." );
dbAPI.model.findAll().success(function(projects) {
  q.push(projects, function(error) {
    if ( error ) {
      console.error( "Something went wrong: " + console.log( JSON.stringify( error ) ) );
      return process.exit( 1 );
    }
  });
});
