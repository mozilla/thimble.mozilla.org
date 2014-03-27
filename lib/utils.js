var http = require("http"),
    base64 = require("./base64");

var Utils = {
  // clean up titles for database-insertion
  slugify: require("uslug"),

  // top level error handler for our app
  error: function(code, msg) {
    var err = new Error(msg || http.STATUS_CODES[code]);
    err.status = code;
    return err;
  },

  // Generate a non-seqential, symmetrical hash for an id,
  // (or reconstitute the id from an id's hash).
  hashProjectId: function(code) {
    var reversed = (typeof code === "string");
    if (reversed) {
      code = parseInt(base64.decode(code), 10);
    }
    code = code | 0;
    var b0 = (code >>  0) & 0xFF,
        b1 = (code >>  8) & 0xFF,
        b2 = (code >> 16) & 0xFF,
        b3 = (code >> 24) & 0xFF,
        newcode = (b3 + (b2 << 8) + (b1 << 16) + (b0 << 24)) | 0;
    return reversed ? newcode : base64.encode(""+newcode);
  },

  // determine whether a url follows the .../thimble/idhash/... pattern
  usesIdHash: function(url) {
    var base = "thimble/",
        start = url.indexOf(base);

    // this is currently unexpected, but let's future-proof:
    if (start === -1) {
      return false;
    }

    var check = url.substring(start + base.length),
        delimited = check.indexOf("/"),
        val;

    // deal with .../thimble/HAIWOEHFAW as well as .../thimble/HAUWHEOIFD/my-page-title:
    if(delimited > 0) {
      check = check.substring(0, delimited);
    }

    // In theory, even if this isn't a true hash, someone could be using a title that is a
    // base64-decodable string, so: check whether it decodes to a pure integer.
    //
    // If it does, statistics suggests this is, with very high probability, a hashId url.
    try {
      val = base64.decode(check);
      return parseInt(val,10) == val; // note: intentional == to coerce number to string
    }  catch (e) {}

    return false;
  }
};

module.exports = Utils;
