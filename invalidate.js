/**
 * This file is a short script that invalidates
 * the cloudfront edge caches for Thimble whenever
 * we deploy a new version.
 */
var AWS = require('aws-sdk');
AWS.config.update({
  // These variables are encrypted in the .travis.yml file
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

var cloudfront = AWS.CloudFront();

// We can't do conditional logic in travis hooks, so
// we detect the branch we're on and bail out early if
// this is a staging deploy. Only production uses CloudFront
if (process.env.TRAVIS_BRANCH === 'bramble') {
  return process.exit(0);
}

var params = {
  DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
  InvalidationBatch: {
    // Use the commit hash as the unique identifier for this invalidation
    CallerReference: process.env.TRAVIS_COMMIT,
    Paths: {
      Quantity: 1,
      // We invalidate everything on deploy
      Items: [ '/*' ]
    }
  }
};

cloudfront.createInvalidation(params, function(err, data) {
  if (err) {
    console.log(err, err.stack);
    return process.exit(1);
  }

  console.log('Successfully invalidated CloudFront!\n', data);
  process.exit(0);
});
