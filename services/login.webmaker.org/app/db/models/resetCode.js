module.exports = function (sequelize, DataTypes) {
  return sequelize.define("ResetCode", {
    code: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    invalid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  });
};
