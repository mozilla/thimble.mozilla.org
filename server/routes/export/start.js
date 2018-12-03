"use strict";

const { proxyExportRequest } = require("../utils");

module.exports = {
  project(config, req, res, next) {
    proxyExportRequest(
      config,
      req,
      res,
      "projects",
      "projectId",
      "start",
      "POST",
      "token",
      201
    );
  },
  publishedProject(config, req, res, next) {
    proxyExportRequest(
      config,
      req,
      res,
      "publishedprojects",
      "publishedProjectId",
      "start",
      "POST",
      "token",
      201
    );
  }
};
