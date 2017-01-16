module.exports = function (sequelize, DataTypes) {
  return sequelize.define("LoginToken", {
    token: {
      type: DataTypes.STRING(11),
      allowNull: false
    },
    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  });
};
