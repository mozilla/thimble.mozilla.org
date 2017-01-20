BEGIN;

ALTER TABLE clients
ADD COLUMN allowed_responses jsonb;

UPDATE clients
SET allowed_responses = '["code"]'::JSONB
WHERE allowed_responses IS NULL;

ALTER TABLE clients
ALTER COLUMN allowed_responses SET NOT NULL;

COMMIT;
