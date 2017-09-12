"use strict";

const util = require("util");
const colors = require("colors");

const LOG_LEVELS = ["info", "warn", "error"];

class Logger {
  constructor(request, environment, level) {
    level = level && level.toLowerCase();

    this.requestID = request.get("X-Request-Id");
    this.requestIP = request.get("X-Forwarded-For");
    this.requestURL = request.originalUrl;
    this.requestMethod = request.method;
    this.isDevelopmentEnv = environment === "development";
    this.logLevel = LOG_LEVELS.indexOf(level);

    if (this.logLevel === -1) {
      this.logLevel = 0; // Default to "info"
    }
  }

  getMessagePrefix() {
    let messagePrefix =
      "method".cyan +
      "=" +
      this.requestMethod +
      " " +
      "path".cyan +
      "=" +
      this.requestURL +
      " ";

    if (!this.isDevelopmentEnv) {
      messagePrefix =
        "[request_id=" +
        this.requestID +
        "] " +
        messagePrefix +
        "fwd=" +
        this.requestIP +
        " ";
    }

    return messagePrefix;
  }

  static formatMessage(args) {
    let message = "";

    Array.from(args).forEach(function(arg) {
      message += util.inspect(arg);
    });

    return message;
  }

  error() {
    const message = colors.red("ERROR: " + Logger.formatMessage(arguments));
    console.log(this.getMessagePrefix() + message);
  }

  info() {
    if (this.logLevel > 0) {
      return;
    }

    const message = colors.cyan("INFO: " + Logger.formatMessage(arguments));
    console.log(this.getMessagePrefix() + message);
  }

  warn() {
    if (this.logLevel > 1) {
      return;
    }

    const message = colors.yellow("WARN: " + Logger.formatMessage(arguments));
    console.log(this.getMessagePrefix() + message);
  }
}

module.exports = Logger;
