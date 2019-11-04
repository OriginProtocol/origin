# `@origin/auth-utils`

Contains helper functions and middleware to be used by other packages

## Environment Variables

### AUTH_PRIV_KEY
RSA private key. Needed when generating auth tokens. **NOT** requied for verification.

### AUTH_PUB_KEY
RSA public key. Needed for verifying and blacklisting auth tokens. **NOT** requied for token generation

### TOKEN_EXPIRES_IN
The number of days after which the token should expire

## Usage

### Generating a token for an ETH address
```
const { generateToken }  = require('@origin/auth-utils/src/utils')

const { authToken, issuedAt, expiresAt } = generateToken({
  address: '0x1111....'
})
```

### Verifying a token
```
const { verifyToken }  = require('@origin/auth-utils/src/utils')

const { address, issuedAt, expiresAt } = verifyToken(authToken)
```

### Blacklisting a token
Adds a token to blacklist if it is a valid one and hasn't been revoked before
```
const { tokenBlacklist }  = require('@origin/auth-utils/src/utils')
await tokenBlacklist.revokeToken(authToken, revokedBy, reason)
```

### Check if token is blacklisting
```
const { tokenBlacklist }  = require('@origin/auth-utils/src/utils')
const blacklisted = await tokenBlacklist.isBlacklisted(authToken)
```

