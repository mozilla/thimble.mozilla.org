DO
$do$
BEGIN
IF NOT EXISTS (SELECT * FROM clients WHERE client_id='test') THEN
  INSERT INTO clients VALUES(
    'test',
    'test',
    '["password", "authorization_code"]'::jsonb,
    '["code", "token"]'::jsonb,
    'http://localhost:3500/callback'
  );
END IF;
END
$do$
