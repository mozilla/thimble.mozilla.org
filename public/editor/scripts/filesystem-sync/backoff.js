/**
 * Determine a backoff delay (ms) to wait before running the next
 * network operation. Inspired by https://github.com/awslabs/aws-arch-backoff-simulator/blob/master/src/backoff_simulator.py
 */
var BACKOFF_BASE_MS = require("constants").BACKOFF_BASE_MS;
var BACKOFF_MAX_DELAY_MS = require("constants").BACKOFF_MAX_DELAY_MS;

// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function _getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Backoff() {
  this.iter = 0;
}

Backoff.prototype.next = function() {
  this.iter++;
  var v = Math.min(
    BACKOFF_BASE_MS * Math.pow(2, this.iter),
    BACKOFF_MAX_DELAY_MS
  );
  return _getRandomIntInclusive(0, v);
};

module.exports = Backoff;
