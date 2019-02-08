![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

Head to https://www.originprotocol.com/developers to learn more about what we're building and how to get involved.

# Origin Wallet

[![app-store](https://user-images.githubusercontent.com/273937/52288003-25b7b700-2920-11e9-9c9a-0a76d04e0c99.png)](https://itunes.apple.com/app/origin-wallet/id1446091928)

Read about Origin Wallet [on Medium](https://medium.com/originprotocol/introducing-origin-wallet-decentralized-commerce-goes-mobile-ecb0f41aa543).

Origin Wallet is an "ejected" React Native application. Go [here](https://facebook.github.io/react-native/docs/getting-started.html#installing-dependencies) to read about getting started with React Native. This application was created with the now-archived [Create React Native App](https://github.com/react-community/create-react-native-app).

## Local Development

This guide will help you to install a local build of Origin Wallet on a device or simulator so that you can modify the application itself. An alternative would be to connect the App Store or TestFlight version of the application to a local blockchain running on your machine, which would be a simpler way to test with Origin Wallet.

### Dependencies

You should be familiar with running Origin.js and the DApp outside of Origin Box as described [here](https://github.com/OriginProtocol/origin/blob/master/DEVELOPMENT.md#using-npm--lerna).

Install the following:

- [Watchman](https://facebook.github.io/watchman/): `brew install watchman`

- [React Native CLI](https://facebook.github.io/react-native/docs/understanding-cli): `npm install -g react-native-cli`

- [Xcode](https://developer.apple.com/xcode/)

- Xcode Command Line Tools: `xcode-select --install`

- [Redis](https://redis.io/): `brew install redis`

- [PostgreSQL](https://www.postgresql.org/)

### Environment Variables

You will need to create four `.env` files to hold the environment variables that are required by [origin-dapp](https://github.com/OriginProtocol/origin/tree/master/origin-dapp), [origin-discovery](https://github.com/OriginProtocol/origin/tree/master/origin-discovery), [origin-linking](https://github.com/OriginProtocol/origin/tree/master/origin-linking), [origin-mobile](https://github.com/OriginProtocol/origin/tree/master/origin-mobile), and [origin-notifications](https://github.com/OriginProtocol/origin/tree/master/origin-notifications). Here are examples with suggested values:

**origin-dapp/.env**
```
BRIDGE_SERVER_DOMAIN=bridge.staging.originprotocol.com
BRIDGE_SERVER_PROTOCOL=https

ETH_NETWORK_ID=999
MAINNET_DAPP_BASEURL="https://dapp.originprotocol.com"
RINKEBY_DAPP_BASEURL="https://demo.staging.originprotocol.com"

PROVIDER_URL=http://localhost:8545

BLOCK_EPOCH=0

# MetaMask account 4 (default local blockchain)
AFFILIATE_ACCOUNT=0x821aea9a577a9b44299b9c15c88cf3087f3b5544
# MetaMask account 5 (default local blockchain)
ARBITRATOR_ACCOUNT=0x0d1d4e623d10f9fba5db95830f7d3839406c6af2
# MetaMask account 6 (default local blockchain)
MESSAGING_ACCOUNT=0x2932b7a2355d6fecc4b5c0b6bd44cc31df247a2e

IPFS_API_PORT=5002
IPFS_DOMAIN=localhost
IPFS_GATEWAY_PORT=8080
IPFS_GATEWAY_PROTOCOL=http
IPFS_SWARM=

MOBILE_LOCALHOST_IP=YOUR-WIFI-IP-ADDRESS
SHOW_WALLET_LINKER=true
WALLET_LANDING_URL=https://www.originprotocol.com/mobile
WALLET_LINKER_URL=http://localhost:3008
```

**origin-discovery/.env**
```
AFFILIATE_ACCOUNT=0x821aea9a577a9b44299b9c15c88cf3087f3b5544
ARBITRATOR_ACCOUNT=0x0d1d4e623d10f9fba5db95830f7d3839406c6af2
ATTESTATION_ACCOUNT=0x99C03fBb0C995ff1160133A8bd210D0E77bCD101
BLOCK_EPOCH=0
DATABASE_URL=postgresql://localhost/discovery
NETWORK_ID=999
IPFS_URL=http://localhost:8080/
WEB3_URL=http://localhost:8545/
```

**origin-linking/.env**
```
ATTESTATION_ACCOUNT=0x99C03fBb0C995ff1160133A8bd210D0E77bCD101

APNS_BUNDLE_ID=com.originprotocol.catcher
APNS_KEY_FILE=
APNS_KEY_ID=
APNS_TEAM_ID=

DAPP_URL=http://localhost:3000/
DATABASE_URL=postgresql://localhost/origin
PROVIDER_URL=http://localhost:8545/
REDIS_URL=redis://127.0.0.1:6379

IPFS_API_PORT=5002
IPFS_DOMAIN=localhost
IPFS_GATEWAY_PORT=8080
IPFS_GATEWAY_PROTOCOL=http

NOTIFY_TOKEN=
```

**origin-mobile/.env**
```
API_SERVER_PROTOCOL=http
API_SERVER_DOMAIN=localhost
API_SERVER_PORT=3008
DEFAULT_API_SERVER_DOMAIN=

IPFS_API_PORT=5002
IPFS_DOMAIN=localhost
IPFS_GATEWAY_PORT=8080
IPFS_GATEWAY_PROTOCOL=http
IPFS_SWARM=

MAINNET_API_SERVER=https://linking.originprotocol.com
RINKEBY_API_SERVER=https://linking.staging.originprotocol.com
PROVIDER_URL=http://localhost:8545/
CB_BW_CODE=
```

**origin-notifications/.env**
```
DAPP_OFFER_URL=http://localhost:3000/#/purchases/
DATABASE_URL=postgresql://localhost/notification
LINKING_NOTIFY_ENDPOINT=http://localhost:3008/api/wallet-linker/eth-notify
LINKING_NOTIFY_TOKEN=
VAPID_EMAIL_ADDRESS=
VAPID_PRIVATE_KEY=
VAPID_PUBLIC_KEY=
```

In the origin-linking and origin-notifications `.env` files, two of the values will need to match. Add any string of your choice to both the `NOTIFY_TOKEN` and `LINKING_NOTIFY_TOKEN` values.

If you want to test with mobile Safari on the same device as the application, find your computer's [internal WiFi network IP address](https://www.wikihow.com/Find-Your-IP-Address-on-a-Mac#Finding_Your_Internal_IP_.28OS_X_10.4.29_sub) and add it to the `MOBILE_LOCALHOST_IP` value for origin-dapp.

### Setup
- Start PostgreSQL
- Start Redis: `redis-server`
- `createdb origin`
- origin $ `npm run install:mobile` 👈 instead of `npm install` at the Origin monorepo root
- origin/origin-linking $ `npm run migrate`

### Startup
- origin/origin-js $ `npm run start`
- origin/origin-js $ `npm run build:watch` (compiles `dist` directory with build)
- origin/origin-linking $ `npm run start`
- origin/origin-dapp $ `npm run start`
- origin/origin-mobile $ `npm run install-local`
- origin/origin-mobile $ `npm run start -- --reset-cache`
- Open Xcode and build for your desired device

### Troubleshooting

> Linker command failed with exit code…

- origin/origin-mobile $ `npm run ios`
- Close simulator
- In Xcode, Project > Clean Build Folder
- Try again

-----------

> error: bundling failed: Error: Unable to resolve module origin/common/enums...

This can be caused by not running `npm run install-local` or not _rerunning_ it after doing a root-level `npm install` (which deletes various things from origin/origin-mobile/node_modules).

-----------

Check [the React Native docs](https://facebook.github.io/react-native/docs/troubleshooting).

-----------

📲 Don't forget to have WiFi enabled on your both of your devices and connected.
