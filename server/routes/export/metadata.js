"use strict";

const { proxyExportRequest } = require("../utils");

module.exports = {
  project(config, req, res, next) {
    proxyExportRequest(config, req, res, "projects", "projectId", "metadata");
  },
  publishedProject(config, req, res, next) {
    proxyExportRequest(
      config,
      req,
      res,
      "publishedprojects",
      "publishedProjectId",
      "metadata"
    );
  }
};
