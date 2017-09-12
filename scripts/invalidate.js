/**
 * This file is a short script that invalidates
 * the cloudfront edge caches for Thimble whenever
 * we deploy a new version.
 */
var AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

var cloudfront = new AWS.CloudFront();
var params = {
  DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
  InvalidationBatch: {
    CallerReference: Date.now().toString(),
    Paths: {
      Quantity: 1,
      // We invalidate everything
      Items: ["/*"]
    }
  }
};

cloudfront.createInvalidation(params, function(err, data) {
  if (err) {
    console.log(err, err.stack);
    return process.exit(1);
  }

  console.log("Successfully invalidated CloudFront!\n", data);
  process.exit(0);
});
