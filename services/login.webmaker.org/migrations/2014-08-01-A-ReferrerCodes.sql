# Create the new table, then migrate the existing data
CREATE TABLE `ReferrerCodes` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `referrer` VARCHAR(255), `userStatus` TEXT, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, `UserId` INTEGER);
INSERT INTO `ReferrerCodes` (`referrer`, `userStatus`, `createdAt`, `updatedAt`, `UserId`)
 SELECT referrer, 'new' as userStatus, createdAt, createdAt, id FROM Users WHERE referrer IS NOT NULL;
