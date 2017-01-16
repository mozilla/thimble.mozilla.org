# Change the column name from preflocale to prefLocale
ALTER TABLE `Users` CHANGE COLUMN `preflocale` `prefLocale` VARCHAR(255) NOT NULL DEFAULT 'en-US';
