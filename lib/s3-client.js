"use strict";

const noxmox = require(`noxmox`);

class S3Client {
  static connect() {
    if (process.env.S3_EMULATION) {
      process.env.AWS_BUCKET = `test`;

      return noxmox.mox.createClient({
        key: `local`,
        secret: `host`,
        bucket: process.env.AWS_BUCKET
      });
    }

    return noxmox.nox.createClient({
      key: process.env.AWS_ACCESS_KEY_ID,
      secret: process.env.AWS_SECRET_ACCESS_KEY,
      bucket: process.env.AWS_BUCKET
    });
  }
}

module.exports = S3Client;
