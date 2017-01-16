# Add the isCollaborator column to the login server database
ALTER TABLE webmakers.Users ADD COLUMN isCollaborator TINYINT(1);
