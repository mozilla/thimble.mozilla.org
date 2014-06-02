ALTER TABLE
    ThimbleProjects ADD COLUMN email VARCHAR(255)
; UPDATE
    ThimbleProjects
SET
    email = userid
; ALTER TABLE
    ThimbleProjects DROP
        COLUMN userid
; ALTER TABLE
    ThimbleProjects ADD COLUMN userid INTEGER
;
