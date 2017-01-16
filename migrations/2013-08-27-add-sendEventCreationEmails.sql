/* Add the isCollaborator column to the login server database, default to true */
ALTER TABLE Users ADD COLUMN sendEventCreationEmails TINYINT(1) NOT NULL DEFAULT 1;
