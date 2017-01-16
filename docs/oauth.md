# OAuth2 API

OAuth2 is a protocol that allows applications to use Webmaker accounts without needing to store a username and password.

Before you can use OAuth2 you'll need to register your application.

## Registering your application

You'll need to register your application before you can use it with Webmaker. In order to register, we need the following info sent via email to [jbuck](mailto:jon@mozillafoundation.org):

* **Name** - The friendly name of your application e.g. "Buckley's Bees".
* **Description** - A description of your application e.g. "Buckley's Bees sells the best honey in Ontario".
* **Image** - An image that represents your application.
* **Homepage URL** - The full URL to your application homepage e.g. "https://buckleysbees.ca".
* **Redirect URL** - Your application's OAuth2 callback URL e.g. "https://buckleysbees.ca/oauth2/callback".

Once you've registered your application you'll recieve your application credentials:

* **Client ID** - A string identifying your application. This value is not secret and can be shown publicly e.g. `wm_id_BTQNPABtUqqApaDrcsDa`.
* **Client Secret** - A string. This value is secret and must not be shared with anyone e.g. `wm_secret_iHmAWhvCwBYnuE6aZHcArBEPohanKmmWr8LcyBBPZYRkAxdmui`.

## Web Application Flow

The web application flow is ideal for services that have a server-side component to securely store the client secret and user's access tokens.

### 1. Redirect users to request access

To start the web application flow you need to redirect your users browser to Webmaker.

`GET https://id.webmaker.org/login/oauth/authorize`

**Parameters**

<table>
  <tr>
    <th>Name</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>client_id</td>
    <td>The client ID you received when you registered your application.</td>
  </tr>
  <tr>
    <td>response_type</td>
    <td>The response_type must be set to "code".</td>
  </tr>
  <tr>
    <td>action</td>
    <td>Optional. If provided, should be <code>signup</code> or <code>signin</code>. Send to improve the user experience, based on whether the user clicked on a Sign In or Sign Up button. <code>signin</code> is the default.</td>
  </tr>
  <tr>
    <td>scopes</td>
    <td>A space separated list of scopes.</td>
  </tr>
  <tr>
    <td>state</td>
    <td>An unguessable random string. It is used to protect against cross-site request forgery attacks.</td>
  </tr>
</table>

**Example**

`GET https://id.webmaker.org/login/oauth/authorize?client_id=wm_id_BTQNPABtUqqApaDrcsDa&response_type=code&scopes=user&state=Nvqfc67z`

### 2. Webmaker redirects back to your application

If the user accepts your request, Webmaker redirects back to your application with a temporary authorization code in a `code` parameter, your application's client ID in a `client_id` parameter, and the state you provided in the previous step in a `state` parameter.

Your application must verify that the `state` and `client_id` parameters match the ones it provided when the sign-in process started. If you do not verify these parameters, a malicious party could hijack the sign-in process.

`GET https://buckleysbees.ca/oauth2/callback`

**Parameters**

<table>
  <tr>
    <th>Name</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>client_id</td>
    <td>The client ID you received when you registered your application.</td>
  </tr>
  <tr>
    <td>code</td>
    <td>A temporary authorization code.</td>
  </tr>
  <tr>
    <td>state</td>
    <td>The state value the application sent when starting the login flow.</td>
  </tr>
</table>

**Example**

`GET https://buckleysbees.ca/oauth2/callback?client_id=wm_id_BTQNPABtUqqApaDrcsDa&state=Nvqfc67z&code=wm_code_LWQAxCBsrKs7PJCG4cHj&state=Nvqfc67z`

### 3. Exchange authorization code for access token

Exchanging the authorization code must be done server-side to ensure that you don't reveal your client secret.

`POST https://id.webmaker.org/login/oauth/access_token`

**Parameters**

<table>
  <tr>
    <th>Name</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>client_id</td>
    <td>The client ID you received when you registered your application.</td>
  </tr>
  <tr>
    <td>client_secret</td>
    <td>The client secret you received when you registered your application.</td>
  </tr>
  <tr>
    <td>grant_type</td>
    <td>The grant_type must be set to "authorization_code".</td>
  </tr>
  <tr>
    <td>code</td>
    <td>The temporary authorization code you obtained in the previous step.</td>
  </tr>
</table>

**Example**

```
POST https://id.webmaker.org/login/oauth/access_token
Content-Type: application/x-www-form-urlencoded

client_id=wm_id_BTQNPABtUqqApaDrcsDa&state=Nvqfc67z&client_secret=wm_secret_iHmAWhvCwBYnuE6aZHcArBEPohanKmmWr8LcyBBPZYRkAxdmui&code=wm_code_LWQAxCBsrKs7PJCG4cHj
```

**Response**

If the authorization code exchange is approved then you will recieve an access token:

```
{
  "access_token": "wm_token_rizCEigqRefeU8Na9JDmZJkzzQzgVZepHTWjiHbtQKsyotAqGZ",
  "scope": "user",
  "token_type": "bearer"
}
```

### 4. Use the access token to access the API

To access the API using your access token, set the `Authorization` header for each request:

```
Authorization: token wm_token_rizCEigqRefeU8Na9JDmZJkzzQzgVZepHTWjiHbtQKsyotAqGZ
```
### Get User Data

Retrieve information about the user using an access token. Requires "user" and "email" scopes on the access token

```
GET http://id.webmaker.org/user
Authorization: token wkcuSD213409XCvdssd3RZX8324rtBThnzW
```

**Response**

```
{
  username: "user",
  id: 1,
  email: "user@example.org",
  avatar: "https://secure.gravatar.com/avatar/5410ec660422c8ea12d4a28ef794a23a"
}
```

### Logout

To log out of id.webmaker.org, use the /logout route

`GET https://id.webmaker.org/logout`

**Parameters**

<table>
  <tr>
    <th>Name</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>client_id</td>
    <td>The client ID of the application to redirect back to after clearing the session cookie</td>
  </tr>
</table>

**Example**

`GET https://id.webmaker.org/logout?client_id=wm_id_BTQNPABtUqqApaDrcsDa`

**Response**

After a successfully clearing the session, you'll be redirected to the redirect_uri of the supplied client_id, with a `logout=true` in the search portion of the redirect URL

e.g `https://example.org/oauth_redirect?logout=true`

## Native Application Flow

Native applications can use the password grant type to authenticate Webmaker users, without compromising their client_secret.
Clients must be pre-approved to use this grant type.

### 1. Request an access token

Prompt the user to enter their username and password, and craft a request to:

`POST https://id.webmaker.org/login/oauth/access_token`

**Parameters**

<table>
  <tr>
    <th>Name</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>client_id</td>
    <td>The client ID you received when you registered your application.</td>
  </tr>
  <tr>
    <td>grant_type</td>
    <td>The grant_type must be set to "password".</td>
  </tr>
  <tr>
    <td>uid</td>
    <td>The webmaker user's username or email</td>
  </tr>
  <tr>
    <td>password</td>
    <td>The webmaker user's password</td>
  </tr>
  <tr>
    <td>scopes</td>
    <td>space delimited list of scopes to associate with the access_token</td>
  </tr>
</table>

**Example**
```
POST https://id.webmaker.org/login/oauth/access_token
Content-Type: application/x-www-form-urlencoded

client_id=wm_id_BTQNPABtUqqApaDrcsDa&state=Nvqfc67z&uid=webmakerusername&password=users-pass-phrase&grant_type=password&scopes=required%20scopes
```
### 2. Use the access token to access the API

To access the API using your access token, set the `Authorization` header for each request:

```
Authorization: token wm_token_rizCEigqRefeU8Na9JDmZJkzzQzgVZepHTWjiHbtQKsyotAqGZ
```

## Single Page Web App Flow

Single page web apps that don't have a web server backing them can make use of this flow.

To start this flow you need to redirect your users browser to Webmaker.

`GET https://id.webmaker.org/login/oauth/authorize`

**Parameters**

<table>
  <tr>
    <th>Name</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>client_id</td>
    <td>The client ID you received when you registered your application.</td>
  </tr>
  <tr>
    <td>response_type</td>
    <td>The response_type must be set to "token".</td>
  </tr>
  <tr>
    <td>action</td>
    <td>Optional. If provided, should be <code>signup</code> or <code>signin</code>. Send to improve the user experience, based on whether the user clicked on a Sign In or Sign Up button. <code>signin</code> is the default.</td>
  </tr>
  <tr>
    <td>scopes</td>
    <td>A space separated list of scopes.</td>
  </tr>
  <tr>
    <td>state</td>
    <td>The state value the application sent when starting the login flow.</td>
  </tr>
</table>

**Example**

`GET https://id.webmaker.org/login/oauth/authorize?client_id=wm_id_BTQNPABtUqqApaDrcsDa&response_type=token&scopes=user`

### 2. Webmaker redirects back to your application

If the user accepts your request, Webmaker redirects back to your application with the API token in a uri fragment

**example**

`GET https://buckleysbees.ca/webapp#token=wm_token_rizCEigqRefeU8Na9JDmZJkzzQzgVZepHTWjiHbtQKsyotAqGZ`

## Scopes

Scopes let you specify exactly what type of access you need. Scopes limit access for OAuth tokens.

<table>
  <tr>
    <th>Name</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>user</td>
    <td>Grants read-only access to public information.</td>
  </tr>
  <tr>
    <td>projects</td>
    <td>Grants write permissions to Webmaker projects, pages and elements owned by the user</td>
  </tr>
</table>

