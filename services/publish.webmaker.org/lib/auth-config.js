"use strict";

// This file borrowed from api.webmaker.org

module.exports = function(validateFunc) {
  return {
    validateFunc: validateFunc,
    allowQueryToken: false,
    tokenType: `token`
  };
};
