module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ThimbleProject', {
    // webmaker id for the person whose project this is
    userid: {
      type: DataTypes.STRING,
      validate: { notEmpty: true }
    },
    // was this a remix of another page?
    originalURL: {
      type: DataTypes.STRING,
      validate: { isURL: true, notEmpty: false }
    },
    // the raw HTML data, used for automated republication
    rawData: {
      type: DataTypes.TEXT,
      validate: { notEmpty: true }
    },
    // the Bleach-sanitized HTML data, used for remixing
    sanitizedData: {
      type: DataTypes.TEXT,
      validate: { notEmpty: true }
    },
    // GA-injected etc. HTML data, used for serving "the project" outside of remixing
    finalizedData: {
      type: DataTypes.TEXT,
      validate: { notEmpty: true }
    }
  },{
    // let Sequelize handle timestamping
    timestamps: true,
    // content is unicode.
    charset: 'utf8',
    // content is definitely unicode.
    collate: 'utf8_general_ci',    
  });
};
