/* globals $: true */
// This creates an input field that can morph into a static placeholder
// when a user wants to save their input.
var $ = require("jquery");

function triggerListeners(context, listenerList, args) {
  if (!listenerList) {
    return;
  }

  listenerList.forEach(function(listener) {
    listener.apply(context, args);
  });
}

function generateElement(mode) {
  return mode === InputField.Modes.STATIC
    ? $("<span></span>")
    : $('<input type="text" />');
}

function create(context) {
  var element = generateElement(context.mode);
  element.attr("id", context.id);
  element.addClass(context._element.attr("class"));

  return element;
}

// This creates a morphable input field and takes in the
// container (should be a div as a DOM element or JQuery object)
// that will contain the input field. The constructor also takes
// a second optional boolean argument that will force the input field
// to be added before any other elements in the container (by default,
// it is appended to the container)
// The input field starts off as a static placeholder
function InputField(container, prepend) {
  // Internal values
  this._container = container instanceof $ ? container : $(container);
  this._element = generateElement(InputField.Modes.STATIC);
  this._listeners = {};

  // Public value
  this.mode = InputField.Modes.STATIC;

  this._container[prepend ? "prepend" : "append"](this._element);
}
InputField.Modes = {
  EDIT: "EDIT",
  STATIC: "STATIC"
};
InputField.EventTypes = {
  SAVE: "SAVE",
  EDIT: "EDIT"
};

// Morph the field into a static placeholder
InputField.prototype.save = function() {
  var context = this;
  var value = context.val();
  var element;

  context.mode = InputField.Modes.STATIC;

  element = create(context);
  context._element.replaceWith(function() {
    return element;
  });
  context._element = element;
  context.val(value);

  triggerListeners(context, context._listeners.change, [
    InputField.EventTypes.SAVE
  ]);
};

// Morph the field into an editable input field
InputField.prototype.edit = function() {
  var context = this;
  var value = context.val();
  var element;

  context.mode = InputField.Modes.EDIT;

  element = create(context);
  context._element.replaceWith(function() {
    return element;
  });
  context._element = element;
  context._element.focus().val(value);

  triggerListeners(context, context._listeners.change, [
    InputField.EventTypes.EDIT
  ]);
};

// Get or set the value of the field
// Similar to JQuery's `.val()` method
InputField.prototype.val = function() {
  // Extract the value from the <input> or <span> depending on input state
  var method = this.mode === InputField.Modes.STATIC ? "text" : "val";

  if (arguments.length === 0) {
    return this._element[method]();
  }

  this._element[method](arguments[0]);
};

// The `id` of the field in the DOM
Object.defineProperty(InputField.prototype, "id", {
  get: function() {
    return this._element.attr("id");
  },
  set: function(id) {
    this._element.attr("id", id);
  }
});

InputField.prototype.addClass = function() {
  this._element.addClass.apply(this._element, arguments);
};

InputField.prototype.removeClass = function() {
  this._element.removeClass.apply(this._element, arguments);
};

InputField.prototype.select = function() {
  this._element.select();
};

// Polyfill: Allow listeners to listen for events triggered by
// the input field
InputField.prototype.on = function(eventName, listener) {
  if (!this._listeners[eventName]) {
    this._listeners[eventName] = [];
  }
  this._listeners[eventName].push(listener);
};

module.exports = InputField;
