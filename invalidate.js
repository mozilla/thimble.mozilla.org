/**
 * This file is a short script that invalidates
 * the cloudfront edge caches for Thimble whenever
 * we deploy a new version.
 */
var exec = require('child_process').exec;
exec('git rev-parse HEAD', function(err, commitHash, stderr) {
  var env = require('habitat').load('.env');
  var AWS = require('aws-sdk');
  AWS.config.update({
    accessKeyId: env.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: env.get('AWS_SECRET_ACCESS_KEY')
  });

  var cloudfront = new AWS.CloudFront();
  var params = {
    DistributionId: env.get('CLOUDFRONT_DISTRIBUTION_ID'),
    InvalidationBatch: {
      CallerReference: commitHash,
      Paths: {
        Quantity: 1,
        // We invalidate everything
        Items: [ '/*' ]
      }
    }
  };

  cloudfront.createInvalidation(params, function(err, data) {
    if (err) {
      console.log(err, err.stack);
      return process.exit(1);
    }

    console.log('Successfully invalidated CloudFront for thimble.mozilla.org!\n', data);
    process.exit(0);
  });
});
