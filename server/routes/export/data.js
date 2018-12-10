"use strict";

const { sendResponseStream } = require("../utils");
const request = require("request");

function data(config, req, res, prefix, idParamName) {
  const { export: { token }, params: { [idParamName]: id } } = req;
  const { publishURL } = config;
  const options = {
    uri: `${publishURL}/${prefix}/${id}/export/data`,
    headers: {
      Authorization: `export ${token}`
    }
  };

  sendResponseStream(res, request.get(options));
}

module.exports = {
  project(config, req, res, next) {
    data(config, req, res, `projects`, `projectId`);
  },
  publishedProject(config, req, res, next) {
    data(config, req, res, `publishedprojects`, `publishedProjectId`);
  }
};
