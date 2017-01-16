# publish.webmaker.org [![Code Climate](https://codeclimate.com/github/mozilla/publish.webmaker.org/badges/gpa.svg)](https://codeclimate.com/github/mozilla/publish.webmaker.org) [![David-DM](https://david-dm.org/mozilla/publish.webmaker.org.svg)](https://david-dm.org/mozilla/publish.webmaker.org)
The teach.org publishing service for X-Ray Goggles and Thimble

## Installation and Use

1) Clone the [publish.webmaker.org](https://github.com/mozilla/publish.webmaker.org) repository

```
$ git clone https://github.com/mozilla/publish.webmaker.org.git
```

2) Install the dependencies

```
$ npm install
```

If you also want to run the tests, install the **lab** testing utility globally

```
$ npm install -g lab
```

3a) Copy the distributed environment file via command line, or manually using a code editor:

```
$ npm run env

OR, if you are on Windows

$ COPY env.dist .env
```

4) Create your postgres database, then run migrations and seeds.

```
$ createdb publish
$ npm run knex
```

N.B. If you would like to create a custom name for your database, you may. However, you
will need to update the `DATABASE_URL` env variable in the `.env` file in order to
reflect that change.

Both of these commands require that you have [PostGres](http://www.postgresql.org/download/) installed, as well as [Knex](http://knexjs.org/) installed globally. To do that you can:

```
$ npm install knex -g
```

Also note that subsequent test runs require an empty `publish` database. Test runs will not automatically clear the database for you for data-integrity reasons, so you will need to either manually clear the tables using your preferred PostgreSQL administration utility, or drop and recreate the database:

```
$ dropdb publish
$ createdb publish
```

5) Run the server at the default log level (`'info'`):

```
$ npm start
```

The server's log level can be set in the environment or the .env file using `LOG_LEVEL=*` with one of `fatal`, `error`, `warn`, `info`, `debug`, `trace`.
If none is given `info` is used.

## Development

This project uses [`jscs`](http://jscs.info/) and [`jshint`](http://jshint.com/)
to enforce the [`mofo-style-guide`](https://github.com/MozillaFoundation/javascript-style-guide).

- To run the style checker, use `npm run jscs`.
- To run the hinter, use `npm run jshint`.
- To run both, use `npm run lint`.

### S3 Emulation

This project uses [`noxmox`](https://github.com/nephics/noxmox) to allow for development without Amazon S3 credentials. By default emulation is turned on. To view published projects, the project runs a `mox-server` for you that taps into the files that `noxmox` writes to disk. Publish will store a reference to this server based on the `PUBLIC_PROJECT_ENDPOINT` environment variable, which defaults to `localhost:8001`.

To use an actual S3 bucket, ensure that the related environment variables are set to allow it:

```
# S3 publish/unpublish
# (enter your own info plz)
export AWS_ACCESS_KEY_ID="your_key"
export AWS_SECRET_ACCESS_KEY="your_secret"
export AWS_BUCKET="your_bucket"

# S3 emulation
export S3_EMULATION=false

# Endpoint for published projects
export PUBLIC_PROJECT_ENDPOINT="http://your-public-endpoint.com"
```

### Exporting a project

If you need to export a project from the database (for debugging purposes for e.g.), you can do so by using the `scripts/export` node command line utility provided.

You can run it using:
```
node scripts/export <project_id> [options]
```
where `[options]` is replaced with the allowed configuration options for the export utility.

This will export the project as a tarball and also has the ability to generate a text file that contains details about the project.

For more documentation and a list of allowed options, run:
```
node scripts/export --help
```

## Documentation

This project uses [`lout`](https://github.com/hapijs/lout) to automatically generate API documention. To view the docs, start the server and visit
[`http://localhost:2015/docs`](http://localhost:2015/docs).
