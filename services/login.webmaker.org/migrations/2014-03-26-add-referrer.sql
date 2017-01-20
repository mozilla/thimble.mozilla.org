# Add the referrer column to the login server database
ALTER TABLE Users ADD COLUMN referrer VARCHAR(255) NULL DEFAULT NULL;
