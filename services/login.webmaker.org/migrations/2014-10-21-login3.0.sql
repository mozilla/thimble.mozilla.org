-- Create the Passwords table
CREATE TABLE `Passwords` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `saltedHash` varchar(60) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB

-- Create the ResetCodes table
CREATE TABLE `ResetCodes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(64) NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT '0',
  `invalid` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB

ALTER TABLE `Users` ADD COLUMN usePasswordLogin TINYINT(1) NOT NULL DEFAULT 0;
