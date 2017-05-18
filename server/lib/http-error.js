"use strict";

const Nunjucks = require("nunjucks");

class HttpError {
  static generic(error, request, response, next) {
    //jshint unused:vars
    const localeInfo = request.localeInfo;
    const locale = (localeInfo && localeInfo.locale) || "en-US";
    const statusCode = response.statusCode || 500;
    let statusMessage = statusCode;
    const statusMessageKey = HttpError.getStatusMessageKey(statusCode);
      response.render("error.html", { status: response.statusCode });
    if(statusMessageKey) {
      statusMessage = Nunjucks.renderString(
        request.gettext(statusMessageKey, locale),
        { httpStatusCode: statusCode }
      );
    }

    const userFriendlyError = {
      statusMessage,
      status: statusCode,
      message: error.userMessage || error,
      localeInfo
    };

    response.format({
      text() {
        response.send(`${userFriendlyError.statusMessage}: ${userFriendlyError.message}`);
      },
      html() {
        // If we get a 500, clear cookies so that we don't wedge user's browser
        // with corrupt/expired cookie info, and for them to clear via browser.
        if(statusCode === 500) {
          request.session = null;
        }
        response.render("error.html", userFriendlyError);
      },
      json() {
        response.send(userFriendlyError);
      },
      default() {
        response.send(userFriendlyError);
      }
    });

    request.log.error(error);
  }

  static notFound(request, response, next) {
    //jshint unused:vars
    response.status(404);
    response.render("error.html", { status: 404 });
  }

  static getStatusMessageKey(statusCode) {
    return statusCode >= 500 ? "errorHttpServiceUnavailable"
      : (statusCode >= 405 || statusCode === 400) ? "errorHttpClientError"
      : statusCode === 404 ? "errorHttpNotFound"
      : statusCode >= 401 ? "errorHttpAuthenticationFailed"
      : null;
  }

  static format(error, request) {
    const localeInfo = request.localeInfo;
    const locale = (localeInfo && localeInfo.locale) || "en-US";
    const userMessageKey = request.errorMessageKey;

    error.userMessage = request.gettext(userMessageKey, locale);
    error.locale = localeInfo && localeInfo.lang;
    return error;
  }
}

module.exports = HttpError;
