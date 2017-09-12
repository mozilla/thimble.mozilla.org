var PopupMenu = require("./popupmenu");

function createDropdownMenus(exclude) {
  exclude = exclude || [];

  if (exclude.indexOf("#navbar-logged-in") === -1) {
    PopupMenu.create(
      "#navbar-logged-in .dropdown-toggle",
      "#navbar-logged-in .dropdown-content"
    );
  }

  if (exclude.indexOf("#navbar-locale") === -1) {
    PopupMenu.create(
      "#navbar-locale .dropdown-toggle",
      "#navbar-locale .dropdown-content"
    );
  }

  if (exclude.indexOf("#navbar-help") === -1) {
    PopupMenu.create(
      "#navbar-help .dropdown-toggle",
      "#navbar-help .dropdown-content"
    );
  }
}

module.exports = {
  createDropdownMenus: createDropdownMenus
};
