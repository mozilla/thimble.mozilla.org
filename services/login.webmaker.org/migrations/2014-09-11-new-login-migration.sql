-- Create LoginTokens Table
CREATE TABLE `LoginTokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(11) NOT NULL,
  `used` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB

-- Add verified Column
ALTER TABLE `Users` ADD COLUMN verified TINYINT(1) NOT NULL DEFAULT 0;
