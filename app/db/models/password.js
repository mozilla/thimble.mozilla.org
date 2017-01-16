module.exports = function (sequelize, DataTypes) {
  return sequelize.define("Password", {
    saltedHash: {
      type: DataTypes.STRING(128)
    }
  });
};
