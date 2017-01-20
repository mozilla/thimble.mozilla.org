const path = require(`path`);

// Check if the server already loaded the env variables
if (!process.env.NODE_ENV) {
  require(`habitat`).load(`.env`);
} else if (process.env.NODE_ENV === `test`){
  // This is a dirty hack for the tests to
  // ensure that the environment is loaded before
  // the fixture files try to read from the database.
  // The coupling is unclear, but it's a quick solution
  // for now.
  require(`habitat`).load(`tests.env`);
}

module.exports = {
  development: {
    client: `pg`,
    debug: process.env.DEBUG == true,
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: path.resolve(__dirname, `migrations`),
      tableName: `migrations`
    }
  }
};
