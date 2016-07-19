"use strict";

class HttpError {
  static generic(error, request, response, next) {
    const userFriendlyError = {
      status: response.statusCode || 500,
      message: error.userMessage || error
    };

    response.format({
      text() {
        response.send(`HTTP ${userFriendlyError.status}: ${userFriendlyError.message}`);
      },
      html() {
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
    response.status(404);
    response.render("error.html", { status: 404 });
  }

  static format(error, request) {
    const prefixKey = request.errorPrefix;
    const prefix = prefixKey ? request.gettext(prefixKey) + " " : "";
    error.userMessage = prefix + request.gettext(error.userMessageKey);
    delete error.userMessageKey;

    const localeInfo = request.localeInfo;
    error.locale = localeInfo && localeInfo.lang;

    return error;
  }
}

module.exports = HttpError;
