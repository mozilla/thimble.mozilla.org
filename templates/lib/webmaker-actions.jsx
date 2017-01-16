var Dispatcher = require("flux").Dispatcher;
var WebmakerDispatcher = new Dispatcher();
var EventEmitter = require("events").EventEmitter;
var Constants = {
  "FORM_ERROR": "FORM_ERROR",
  "FORM_WARNING": "FORM_WARNING",
  "FORM_VALID": "FORM_VALID",
  "FORM_VALIDATION": "FORM_VALIDATION"
};
var WebmakerActions = Object.assign({}, EventEmitter.prototype, {
  displayError: function(data) {
    WebmakerDispatcher.dispatch({
      'data': data,
      'actionType': Constants.FORM_ERROR
    });
  },
  onFormValidation: function(data) {
    WebmakerDispatcher.dispatch({
      'data': data,
      'actionType': Constants.FORM_VALIDATION
    });
  },
  displayWarning: function(data) {
    WebmakerDispatcher.dispatch({
      'data': data,
      'actionType': Constants.FORM_WARNING
    });
  },
  validField: function(data) {
    WebmakerDispatcher.dispatch({
      'data': data,
      'actionType': Constants.FORM_VALID
    });
  },
  addListener: function(actionType, callback) {
    this.on(actionType, callback);
  },
  deleteListener: function(actionType, callback) {
    this.removeListener(actionType, callback);
  },
  emitEvent: function(actionType, data) {
    this.emit(actionType, data);
  }
});

WebmakerDispatcher.register(function(payload) {
  switch(payload.actionType) {
    case Constants.FORM_ERROR:
      WebmakerActions.emitEvent(Constants.FORM_ERROR, payload.data);
      break;

    case Constants.FORM_VALIDATION:
      WebmakerActions.emitEvent(Constants.FORM_VALIDATION, payload.data);
      break;

    case Constants.FORM_WARNING:
      WebmakerActions.emitEvent(Constants.FORM_WARNING, payload.data);
      break;

      case Constants.FORM_VALID:
        WebmakerActions.emitEvent(Constants.FORM_VALID, payload.data);
        break;
    default:
      // no op
  }
})

module.exports = WebmakerActions;
