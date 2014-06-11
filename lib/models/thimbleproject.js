module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ThimbleProject', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // webmaker id for the person whose project this is
    userid: {
      type: DataTypes.INTEGER
    },
    email: {
      type: DataTypes.STRING
    },
    // url for this published project
    url: {
      type: DataTypes.STRING
    },
    // was this a remix of another page?
    remixedFrom: {
      type: DataTypes.STRING
    },
    // the raw HTML data, used for automated republication
    rawData: {
      type: DataTypes.TEXT
    },
    // the sanitized HTML data, used for remixing
    sanitizedData: {
      type: DataTypes.TEXT
    },
    // The id of this project's corresponding make
    makeid: {
      type: "CHAR(40)",
      unique: true
    },
    // the <title> of the HTML data
    title: {
      type: DataTypes.STRING
    }
  },{
    // let Sequelize handle timestamping
    timestamps: true,
    // content is unicode.
    charset: 'utf8',
    // content is definitely unicode.
    collate: 'utf8_general_ci'
  });
};
