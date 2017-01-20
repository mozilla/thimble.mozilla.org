# Add the lastLoggedIn column to the login server database
ALTER TABLE Users ADD COLUMN lastLoggedIn TIMESTAMP NULL DEFAULT NULL;
