/**
 * Exports
 */
module.exports = function (sequelize, DataTypes) {
  return sequelize.define("ReferrerCode", {
    referrer: {
      type: DataTypes.STRING
    },
    userStatus: {
      type: DataTypes.ENUM,
      values: ["new", "existing"]
    }
  }, {
    charset: "utf8",
    collate: "utf8_general_ci"
  });
};
