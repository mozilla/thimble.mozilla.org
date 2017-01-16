module.exports = function (allowedDomains) {
  return function cors(req, res, next) {
    if (allowedDomains[0] === '*' || allowedDomains.indexOf(req.headers.origin) > -1) {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      res.header('Access-Control-Allow-Methods', 'POST');
      res.header('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
      res.header('Access-Control-Expose-Headers', 'Content-Type');
      res.header('Access-Control-Allow-Credentials', true);
    }
    next();
  };
};
