/* globals $: true */

var $ = require("jquery");

// Manage a transparent div to capture mouse clicks over the iframe
function Underlay(parent, onclick) {
  this._onclick = onclick;

  var underlay$ = (this._underlay$ = $("<div class=click-underlay></div>"));
  $(parent).after(underlay$);
  underlay$.on("click", onclick);
}
Underlay.prototype.remove = function() {
  this._underlay$.off("click", this._onclick);
  this._underlay$.remove();
};

module.exports = Underlay;
