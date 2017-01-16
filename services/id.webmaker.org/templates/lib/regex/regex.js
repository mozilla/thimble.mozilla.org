module.exports = {
  email: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i,
  password: {
    bothCases: /^.*(?=.*[a-z])(?=.*[A-Z]).*$/,
    digit: /\d/
  },
  username:  /^[a-zA-Z0-9\-]{1,20}$/
};
