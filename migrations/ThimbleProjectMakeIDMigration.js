/**
 * This Script is designed to upgrade existing thimble projects
 * that are already in the MakeAPI. It will grab each makes id
 * and find it's corresponding Thimble project and update it
 * with that makes id.
 **/

var async = require( "async" ),
    habitat = require( "habitat" ),
    env;

habitat.load();
env = new habitat();

    // Database information
var dbConfig = env.get( "DB" ),
    db = require( "../lib/database" ),
    dbAPI = db( "thimbleproject", dbConfig ),
    makeEnv = env.get( "make" ),
    makeapi,
    utils = require( "../lib/utils" ),
    page = 1,
    LIMIT = 1000,
    completed,
    q;

makeapi = require( "makeapi-client" )({
  apiURL: makeEnv.endpoint,
  hawk: {
    key: makeEnv.privatekey,
    id: makeEnv.publickey,
    algorithm: "sha256"
  }
});

function processThimbleMake( make, asyncCallback ) {
  dbAPI.model.find({ where: {
    title: utils.slugify( make.title ),
    url: make.url,
    makeid: null
  }})
  .error( asyncCallback )
  .then(function( project ) {
    if ( project && !project.makeid ) {
      project.updateAttributes({
        makeid: make.id
      })
      .error( asyncCallback )
      .then(function( updatedProject ) {
        asyncCallback( null, updatedProject );
      });
    } else {
      asyncCallback( null, project );
    }
  });
}

function getMakes( page ) {
  makeapi
  .contentType( "application/x-thimble" )
  .page( page )
  .limit( LIMIT )
  .then(function( err, results, count ) {
    if ( err ) {
      console.log( "Something went horribly wrong: " + err.toString() );
      return process.exit( 1 );
    }

    completed += results.length;
    q.push( results, function( error ) {
      if ( error ) {
        console.log( "Something went horribly wrong: " + error.toString() );
        return process.exit( 1 );
      }

      if ( completed < count ) {
        page++;
        getMakes( page );
      }
    });
  });
}

q = async.queue( processThimbleMake, 5 );

q.drain = function() {
  console.log( "Hooray! All of the thimble makes have been updated" );
};

getMakes( page );
