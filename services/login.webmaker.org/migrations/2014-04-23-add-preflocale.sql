# Add the preflocale column to the login server database
ALTER TABLE Users ADD COLUMN preflocale VARCHAR(255) NOT NULL DEFAULT 'en-US';
