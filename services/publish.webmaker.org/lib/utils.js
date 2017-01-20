"use strict";

// General purpose utility functions

class DateTracker {
  static isDate(value) {
    return value instanceof Date;
  }

  static formatDatesInModel(model) {
    if (typeof model === `object`) {
      // Have to do this because of this bug: https://github.com/tgriesser/bookshelf/issues/668
      if (model.date_created) {
        model._date_created = model.date_created;
        delete model.date_created;
      }
      if (model.date_updated) {
        model._date_updated = model.date_updated;
        delete model.date_updated;
      }
    }

    return model;
  }

  static parseDatesInModel(model) {
    if (typeof model === `object`) {
      if (typeof model._date_created !== `undefined`) {
        model.date_created = model._date_created;
        delete model._date_created;
      }
      if (typeof model._date_updated !== `undefined`) {
        model.date_updated = model._date_updated;
        delete model._date_updated;
      }
    }

    return model;
  }

  static getDate(data, property, isModel) {
    return isModel ? data.get(property) : data[property];
  }

  // Pass in a model or regular object,
  // convert the `date_created` and `date_updated` into ISO format and
  // set it back on the model/object
  static convertToISOStrings(data) {
    const created = DateTracker.getDate(data, `date_created`);
    const updated = DateTracker.getDate(data, `date_updated`);

    if (DateTracker.isDate(created)) {
      data.date_created = created.toISOString();
    }

    if (DateTracker.isDate(updated)) {
      data.date_updated = updated.toISOString();
    }

    return data;
  }

  static convertToISOStringsForModel(model) {
    const created = DateTracker.getDate(model, `date_created`, true);
    const updated = DateTracker.getDate(model, `date_updated`, true);

    if (DateTracker.isDate(created)) {
      model.set(`date_created`, created.toISOString());
    }

    if (DateTracker.isDate(updated)) {
      model.set(`date_updated`, updated.toISOString());
    }

    return model;
  }
}

module.exports = {
  DateTracker
};
