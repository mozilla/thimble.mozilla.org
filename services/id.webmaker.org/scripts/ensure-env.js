var fs = require("fs");
var env = require("path").join(__dirname, "..", ".env");

if (fs.existsSync(env) || typeof process.env.NODE_ENV !== 'undefined') process.exit(0);
fs.createReadStream("sample.env").pipe(fs.createWriteStream(env));
