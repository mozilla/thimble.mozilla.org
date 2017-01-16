"use strict";

const config = require(`../../knexfile`).development;

const Knex = require(`knex`)(config);
const Bookshelf = require(`bookshelf`)(Knex);

exports.Bookshelf = Bookshelf;

// For test access to our single knex instance
exports.Knex = Knex;
