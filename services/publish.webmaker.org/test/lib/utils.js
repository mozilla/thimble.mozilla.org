// General utility functions for tests

function validDateResponse(val) {
  return typeof val === 'string' || val === null;
}

module.exports = {
  validDateResponse: validDateResponse
};
