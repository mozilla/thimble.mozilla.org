var badword = require("badword"),
  defaultGravatar = encodeURIComponent("https://stuff.webmaker.org/avatars/webmaker-avatar-200x200.png"),
  md5 = require("MD5");

/**
 * Custom Validation
 */
function isNotBlacklisted(str) {
  if (badword(str)) {
    throw new Error("Contains a bad word!");
  }
}

/**
 * Exports
 */
module.exports = function (sequelize, DataTypes) {
  return sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      validate: {
        isEmail: true
      },
      allowNull: false,
      unique: true
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    username: {
      type: "VARCHAR(20)",
      validate: {
        isNotBlacklisted: isNotBlacklisted
      },
      allowNull: false,
      unique: true
    },
    prefLocale: {
      type: DataTypes.STRING,
      defaultValue: "en-US",
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastLoggedIn: {
      type: "TIMESTAMP NULL DEFAULT NULL"
    },
    usePasswordLogin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isCollaborator: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isSuspended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isMentor: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isSuperMentor: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    sendNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    sendEngagements: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    sendEventCreationEmails: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    sendMentorRequestEmails: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    sendCoorganizerNotificationEmails: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    subscribeToWebmakerList: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    wasMigrated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    bio: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [0, 255],
          msg: "`bio` length must be 0-255 characters"
        }
      }
    },
    location: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [0, 255],
          msg: "`location` length must be 0-255 characters"
        }
      }
    },
    links: {
      type: DataTypes.STRING,
      validate: {
        len: {
          args: [0, 255],
          msg: "`links` length must be 0-255 characters"
        }
      },
      get: function () {
        var val = this.getDataValue("links");

        if (!val) {
          return [];
        }

        return JSON.parse(val);
      },
      set: function (val) {
        this.setDataValue("links", JSON.stringify(val));
      }
    }
  }, {
    charset: "utf8",
    collate: "utf8_general_ci",
    getterMethods: {
      avatar: function () {
        return "https://secure.gravatar.com/avatar/" +
          md5(this.getDataValue("email")) +
          "?d=" + defaultGravatar;
      },
      emailHash: function () {
        return md5(this.getDataValue("email"));
      },
      displayName: function () {
        return this.getDataValue("fullName");
      }
    },
    instanceMethods: {
      serializeForSession: function () {
        return {
          avatar: this.avatar,
          email: this.email,
          emailHash: this.emailHash,
          id: this.id,
          isAdmin: this.isAdmin,
          isMentor: this.isMentor,
          isSuperMentor: this.isSuperMentor,
          prefLocale: this.prefLocale,
          sendEventCreationEmails: this.sendEventCreationEmails,
          sendCoorganizerNotificationEmails: this.sendCoorganizerNotificationEmails,
          sendMentorRequestEmails: this.sendMentorRequestEmails,
          username: this.username
        };
      }
    }
  });
};
