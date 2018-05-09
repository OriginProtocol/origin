# API Documentation

## Attestation Service

All requests should have a `Content-Type` of `application/json`

One of the following HTTP status codes will be returned:
- `200` (success)
- `400` (request failed validation; will be accompanied by errors array, see below)
- `422` (error processing request; will be accompanied by errors array, see below)
- `500` (unexpected server error)

Example error responses (for `400` and `422` status codes):

```
{
    "errors": ["Invalid phone number."]
}
```

```
{
    "errors": ["code: not a valid string.", "identity: not a valid string."]
}
```

- [phone/generate-code](#phonegenerate-code)
- [phone/verify](#phoneverify)
- [email/generate-code](#emailgenerate-code)
- [email/verify](#emailverify)
- [facebook/auth-url](#facebookauth-url)
- [facebook/verify](#facebookverify)
- [twitter/auth-url](#twitterauth-url)
- [twitter/verify](#twitterverify)

### phone/generate-code

#### Request:

POST `/api/attestations/phone/generate-code`

- phone (string): phone number to send code

```
{
    "phone": "5555555555"
}
```

#### Response:

```
{}
```

### phone/verify

#### Request:

POST `/api/attestations/phone/verify`

- identity (string): address of ERC725 identity contract
- phone (string): phone number where code was sent
- code (string): code sent to phone number

```
{
    "identity": "0xc741715D55De72bF12461760BaAF97E0468e7b86",
    "phone": "5555555555",
    "code": "964622"
}
```

#### Response:

- claim type (integer): ERC725 claim type value used in signature
- signature (string): signature for ERC725 attestation
- data (string): ERC725 data value used in signature

```
{
    "claim-type": 10,
    "signature": "0x061ef9cdd7707d90d7a7d95b53ddbd94905cb05dfe4734f97744c7976f2776145fef298fd0e31afa43a103cd7f5b00e3b226b0d62e4c492d54bec02eb0c2a0901b",
    "data": "phone verified"
}
```

### email/generate-code

#### Request:

POST `/api/attestations/email/generate-code`

- email (string): email address to send code

```
{
    "email": "hello@foo.bar"
}
```

#### Response:

```
{}
```

### email/verify

#### Request:

POST `/api/attestations/email/verify`

- identity (string): address of ERC725 identity contract
- email (string): email address where code was sent
- code (string): code sent to email address

```
{
    "identity": "0xc741715D55De72bF12461760BaAF97E0468e7b86",
    "email": "hello@foo.bar",
    "code": "109507"
}
```

#### Response:

- claim type (integer): ERC725 claim type value used in signature
- signature (string): signature for ERC725 attestation
- data (string): ERC725 data value used in signature

```
{
    "claim-type": 11,
    "signature": "0xeb6123e537e17e2c67b67bbc0b93e6b25ea9eae276c4c2ab353bd7e853ebad2446cc7e91327f3737559d7a9a90fc88529a6b72b770a612f808ab0ba57a46866e1c",
    "data": "email verified"
}
```

### facebook/auth-url

#### Request:

GET `/api/attestations/facebook/auth-url`

#### Response:

- url (string): url to be used on the client side to retrieve the [facebook access token code](https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow).

You will want to open this url in a new window, and listen for a [message event](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#The_dispatched_event) that matches the regex `/^facebook-code:/`. That event will contain the code in the form `facebook-code:abcde12345`.

```
{
    "url": "https://www.facebook.com/v2.12/dialog/oauth?client_id=111111111111111&redirect_uri=https://my-url.mydomain/"
}
```

### facebook/verify

#### Request:

POST `/api/attestations/facebook/verify`

- identity (string): address of ERC725 identity contract
- code (string): [facebook access token code](https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow)

```
{
    "identity": "0xC741715d55dE72BF12461760bAAf97e0468E7B8e",
    "code": "abcde12345"
}
```

#### Response:

- claim type (integer): ERC725 claim type value used in signature
- signature (string): signature for ERC725 attestation
- data (string): ERC725 data value used in signature

```
{
    "claim-type": 3,
    "signature": "0xacb7a46c7c622d137e69ee7bf34dc4a3e4664b6cceff2d34ad35c80ce2d550b749010237dc1098ff777d1c61fae06e24d9c7513bde6e61490f28130c9640aeeb1b",
    "data": "facebook verified"
}
```

### twitter/auth-url

#### Request:

GET `/api/attestations/twitter/auth-url`

#### Response:

- url (string): url to be used on the client side to retrieve the [oauth verifier token](https://dev.twitter.com/web/sign-in/implementing). (Note: You will need to set the callback url in your Twitter app to `<host>/redirects/twitter/`. The trailing slash is important.)

You will want to open this url in a new window, and listen for a [message event](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#The_dispatched_event) that matches the regex `/^twitter-oauth-verifier:/`. That event will contain the oauth verifier in the form `twitter-oauth-verifier:abcde12345`.

```
{
    "url": "https://api.twitter.com/oauth/authenticate?oauth_token=abcde12345"
}
```

### twitter/verify

#### Request:

POST `/api/attestations/twitter/verify`

- identity (string): address of ERC725 identity contract
- oauth-verifier (string): [oauth verifier token](https://dev.twitter.com/web/sign-in/implementing)

```
{
    "identity": "0xC741715d55dE72BF12461760bAAf97e0468E7B8e",
    "oauth-verifier": "abcde12345"
}
```

#### Response:

- claim type (integer): ERC725 claim type value used in signature
- signature (string): signature for ERC725 attestation
- data (string): ERC725 data value used in signature

```
{
    "claim-type": 4,
    "signature": "0x67f184ca05b6607b72332c1aa8e8268eebe5a97f4b42da81a0040dfb92bb7dc9033233e93059bffa3f3f7de3f8d08fe0717c7603e6216226bb03a7ec4cf198901b",
    "data": "twitter verified"
}
```
