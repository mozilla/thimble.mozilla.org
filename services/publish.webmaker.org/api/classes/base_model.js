"use strict";

const Bookshelf = require(`./database`).Bookshelf;

const instanceProps = {
  column(columnName, alias, escapeString) {
    const delimiter = escapeString ? `"` : ``;
    const tableName = `${delimiter}${this.tableName}${delimiter}`;
    const fieldName = `${delimiter}${columnName}${delimiter}`;
    const column = `${tableName}.${fieldName}`;

    return alias ? `${column} AS ${delimiter}${alias}${delimiter}` : column;
  }
};

const classProps = {
  transaction: Bookshelf.transaction.bind(Bookshelf)
};

module.exports = Bookshelf.Model.extend(instanceProps, classProps);
