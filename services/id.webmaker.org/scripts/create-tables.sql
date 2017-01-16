CREATE TABLE IF NOT EXISTS "clients"
(
  client_id varchar NOT NULL,
  client_secret varchar NOT NULL,
  allowed_grants jsonb NOT NULL,
  allowed_responses jsonb NOT NULL,
  redirect_uri varchar NOT NULL,
  CONSTRAINT clients_id_pk PRIMARY KEY (client_id)
);

CREATE TABLE IF NOT EXISTS "auth_codes"
(
  auth_code varchar NOT NULL,
  client_id varchar NOT NULL REFERENCES clients(client_id),
  user_id bigint NOT NULL,
  scopes jsonb NOT NULL,
  expires_at timestamp NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT auth_code_pk PRIMARY KEY (auth_code)
);

CREATE TABLE IF NOT EXISTS "access_tokens"
(
  access_token varchar NOT NULL,
  client_id varchar NOT NULL REFERENCES clients(client_id),
  user_id bigint NOT NULL,
  scopes jsonb NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT salted_token_pk PRIMARY KEY (access_token)
);
