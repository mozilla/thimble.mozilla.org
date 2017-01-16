module.exports = {
  get: {
    client: "SELECT client_id, client_secret, allowed_grants, allowed_responses, redirect_uri FROM " +
      "clients WHERE client_id = $1;",
    authCode: "SELECT auth_code, client_id, user_id, scopes, created_at, expires_at FROM " +
      "auth_codes WHERE auth_code = $1;",
    accessToken: "SELECT access_token, client_id, user_id, scopes, created_at FROM " +
      "access_tokens WHERE access_token = $1;"
  },
  create: {
    client: "INSERT INTO clients (client_id, client_secret, allowed_grants, allowed_responses, redirect_uri) " +
      "VALUES($1, $2, $3, $4, $5);",
    authCode: "INSERT INTO auth_codes (auth_code, client_id, user_id, scopes, expires_at) " +
      "VALUES($1, $2, $3, $4, $5);",
    accessToken: "INSERT INTO access_tokens (access_token, client_id, user_id, scopes) " +
      "VALUES($1, $2, $3, $4);"
  },
  remove: {
    authCode: "DELETE FROM auth_codes WHERE auth_code = $1;"
  }
};
