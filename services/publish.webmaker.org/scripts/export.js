"use strict";

const Promise = require(`bluebird`);
const program = require(`commander`);
const PgClient = require(`pg`).Client;
const Tar = require(`tar-stream`);
const colors = require(`colors`);
const fs = Promise.promisifyAll(require(`fs`));
const path = require(`path`);

let client;
let projectID;
let project;
let destination;

colors.setTheme({
  silly: `rainbow`,
  input: `grey`,
  verbose: `cyan`,
  prompt: `grey`,
  info: `green`,
  data: `grey`,
  help: `cyan`,
  warn: `yellow`,
  debug: `blue`,
  error: `red`
});

function getMessage() {
  return Array.from(arguments).filter(arg => !!arg).join(' ').trim();
}

class Log {
  static error() {
    const message = getMessage.apply(null, arguments);
    console.error((`ERROR: ${message}`).error);
    console.error(`\n\n`);
    process.exit(1);
  }

  static info() {
    const message = getMessage.apply(null, arguments);
    console.log(message.verbose);
  }

  static success() {
    const message = getMessage.apply(null, arguments);
    console.log(message.info);
  }
}

function validate() {
  let errorMsg = false;
  const missingError = `must be provided!\n`;

  if (typeof program.args[0] === `undefined`) {
    errorMsg = `Project ID ${missingError}`;
  } else if (typeof program.username === `undefined`) {
    errorMsg = `Username ${missingError}`;
  } else if (typeof program.database === `undefined`) {
    errorMsg = `Database name ${missingError}`;
  }

  projectID = Number(program.args[0]);
  if (isNaN(projectID)) {
    errorMsg = `Project ID must be a number!\n`;
  }

  if (errorMsg) {
    Log.error(errorMsg);
  }
}

function writeProjectDetailsFile(project) {
  return fs.writeFileAsync(
    path.join(destination, `project.txt`),
    JSON.stringify(project, null, 4)
  )
  .then(() => Log.info(`Created project details file...`))
  .catch(function(err) {
    Log.error(
      `Failed to write file with details about project with:`,
      JSON.stringify(err, null, 2)
    );
  });
}

process.on(`exit`, function(code) {
  if (client) {
    client.end();
  }

  process.exit(code);
});

program
.usage(`<project_id> [options]`)
.description(`A utility to export a project or it's published version from the publish database as a tarball`)
.option(`-u, --username <value>`, `DB username`)
.option(`-p, --password [value]`, `DB password`)
.option(`-d, --database <value>`, `DB name`)
.option(`-h, --host [value]`, `DB host server (without the protocol), defaults to localhost`, `localhost`)
.option(`-D, --destination [path]`, `Directory to save the project tarball in, defaults to the current directory`, process.cwd())
.option(`-P, --published`, `Get the published version instead of the WIP project`)
.option(`-i, --include-project`, `Provide a file with details about the project itself such as the name, description, etc. along with the tarball`)
.parse(process.argv);

validate();

destination = path.resolve(process.cwd(), program.destination);

client = Promise.promisifyAll(new PgClient({
  user: program.username,
  database: program.database,
  password: program.password,
  host: program.host,
  ssl: true
}));

client.connectAsync()
.then(function() {
  const cols = [
    `title`, `description`, `publish_url`, `published_id`,
    `client`, `_date_created`, `_date_updated`
  ];

  return client.queryAsync(
    `SELECT "` + cols.join('", "') + `" ` +
    `FROM "projects" ` +
    `WHERE "id" = $1`,
    [ projectID ]
  )
  .then(function(result) {
    project = { id: projectID };
    cols.forEach(function(col) {
      project[col] = result.rows[0][col];
    });

    if (program.includeProject) {
      return writeProjectDetailsFile(project);
    }

    return Promise.resolve();
  })
  .catch(function(err) {
    Log.error(
      `Failed to acquire project from the database with:`,
      JSON.stringify(err, null, 2)
    );
  });
})
.then(function() {
  const table = program.published ? `"publishedFiles"` : `"files"`;
  const fk = program.published ? `"published_id"` : `"project_id"`;
  const id = program.published ? project.published_id : projectID;
  const cols = [ `path`, `buffer` ];

  return client.queryAsync(
    `SELECT "${cols.join('", "')}"` +
    `FROM ${table} ` +
    `WHERE ${fk} = $1`,
    [ id ]
  )
  .then(function(result) {
    const tarStream = Tar.pack();

    function processFile(fileRow) {
      return new Promise(function(resolve) {
        tarStream.entry({ name: fileRow.path }, fileRow.buffer);
        resolve();
      });
    }

    return Promise.map(result.rows, processFile, { concurrency: 2 })
    .then(function() {
      tarStream.finalize();

      return new Promise(function(resolve, reject) {
        const writeStream = fs.createWriteStream(
          path.join(destination, `${project.title}.tar`)
        );

        writeStream.on(`finish`, resolve);
        tarStream.pipe(writeStream);
      });
    });
  })
  .then(Log.info.bind(Log, `Finished tarring the project...`))
  .catch(function(err) {
    Log.error(
      `Failed to tar the project with:`,
      JSON.stringify(err, null, 2)
    );
  });
})
.then(Log.success.bind(Log, `Successfully exported project to ${destination}\n\n`))
.then(process.exit.bind(process, 0))
.catch(function(err) {
  Log.error(
    `FATAL - `,
    JSON.stringify(err, null, 2)
  );
});
