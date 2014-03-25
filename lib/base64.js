/**
 * Wrapper for node's way of doing BASE64 encoding/decoding
 */
module.exports = {
  encode: function (unencoded) {
    return new Buffer(unencoded || '').toString('base64');
  },
  decode: function (encoded) {
    return new Buffer(encoded || '', 'base64').toString('utf8');
  }
};
