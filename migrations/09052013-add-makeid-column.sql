# Add the makeid column to the butter database
ALTER TABLE ThimbleProjects ADD COLUMN makeid CHAR(40);
ALTER TABLE ThimbleProjects ADD UNIQUE KEY(makeid);
