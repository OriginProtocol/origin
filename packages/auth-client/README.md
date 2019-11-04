# `auth-client`

A wrapper that should abstract most things related to interacting with auth-server for DApp and mobile app. 

## Usage

### Stateless mode without persistence
```
import AuthClient from '@origin/auth-client/src/auth-client'

const authClient = new AuthCleint({ ... })
const signature = await web3.eth.sign(payload, address)
const { authToken, expiresAt } = await authClient.getTokenWithSignature(signature, payload)
```
