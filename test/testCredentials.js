module.exports = {
  clients: [
    {
      client_id: 'test',
      client_secret: 'test',
      allowed_grants: [
        'password',
        'authorization_code'
      ],
      redirect_uri: 'http://example.org/oauth_redirect'
    }, {
      client_id: 'test2',
      client_secret: 'test2',
      allowed_grants: [
        'authorization_code'
      ],
      redirect_uri: 'http://example.org/2/oauth_redirect'
    }, {
      client_id: 'test3',
      client_secret: 'test3',
      allowed_grants: [
        'password'
      ],
      redirect_uri: 'http://example.org/3/oauth_redirect'
    }
  ],

  authCodes: {
    test: {
      client_id: 'test',
      user_id: 'test',
      scopes: 'user',
      expires_at: Date.now() + 60 * 1000
    },
    expired: {
      client_id: 'test',
      user_id: 'test',
      scopes: 'user',
      expires_at: Date.now() - 60 * 1000
    },
    mismatched: {
      client_id: 'test2',
      user_id: 'test',
      scopes: 'user',
      expires_at: Date.now() + 60 * 1000
    }
  },

  accessTokens: [
    {
      access_token: 'testAccessToken',
      client_id: 'test',
      user_id: 'test',
      scopes: ['user', 'email'],
      expires_at: Date.now() + 60 * 1000
    },{
      access_token: 'testAccessToken2',
      client_id: 'test',
      user_id: 'test',
      scopes: ['user', 'email', 'foo'],
      expires_at: Date.now() + 60 * 1000
    }, {
      access_token: 'expiredAccessToken',
      client_id: 'test',
      user_id: 'test',
      scopes: ['user', 'email'],
      expires_at: Date.now() - 60 * 1000
    }, {
      access_token: 'invalidScope',
      client_id: 'test',
      user_id: 'test',
      scopes: ['avatar'],
      expires_at: Date.now() + 60 * 1000
    }, {
      access_token: 'getUserFail',
      client_id: 'test',
      user_id: 'invalid',
      scopes: ['user', 'email'],
      expires_at: Date.now() + 60 * 1000
    }
  ]
};
