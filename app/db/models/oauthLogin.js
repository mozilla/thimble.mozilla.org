module.exports = function (sequelize, DataTypes) {
  return sequelize.define("OAuthLogin", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }
  }, {
    charset: "utf8",
    collate: "utf8_general_ci",
    updatedAt: false
  });
};
