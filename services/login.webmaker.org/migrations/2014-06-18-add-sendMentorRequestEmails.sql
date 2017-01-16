# Add the sendMentorRequestEmails column to the login server database
ALTER TABLE Users ADD COLUMN sendMentorRequestEmails TINYINT(1) NOT NULL DEFAULT 1;
