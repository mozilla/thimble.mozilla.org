module.exports = function (sequelize, DataTypes) {
  return sequelize.define("OAuthClient", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    client: {
      type: DataTypes.STRING
    }
  }, {
    charset: "utf8",
    collate: "utf8_general_ci",
    updatedAt: false
  });
};
