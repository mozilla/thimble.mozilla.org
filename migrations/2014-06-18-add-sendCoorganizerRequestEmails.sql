# Add the sendCoorganizerRequestEmails column to the login server database
ALTER TABLE Users ADD COLUMN sendCoorganizerRequestEmails TINYINT(1) NOT NULL DEFAULT 1;
