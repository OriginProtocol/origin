# Origin JS Documentation

## Introduction

Welcome to the origin.js documentation! origin.js is a Javascript library for interacting with the Origin protocol.
Using the library you can create new listings from your applications, purchase them, or update them from your own off-chain applications. 

More information can be found at [Origin Platform Readme](/README.md) 

### Warning
This is still an alpha version which will evolve significantly before the main net release. 


## Install 

### Local
For developing on `origin.js`, it is better to link the package rather than installing it. (Otherwise you would need to run `npm build` everytime you made a change to the package.)

In `origin.js` run:
```
npm link
```

In your dapp (for example, the Origin demo-dapp) run:
```
npm link @originprotocol/origin
```
This will create a symlink, direcly linking the dapp to your local `origin.js` package.

### NPM
```
npm install @originprotocol/origin --save
```

### Yarn
```
yarn add @originprotocol/origin
```

## Import 
```
import { contractService, ipfsService, originService } from '@originprotocol/origin'
```

## IPFS

If you are running a local IPFS daemon then set the following environment variables:

```
export IPFS_DOMAIN=127.0.0.1
export IPFS_API_PORT=5001
export IPFS_GATEWAY_PORT=8080
export IPFS_GATEWAY_PROTOCOL=http
```

Configure your local IPFS daemon with the following settings to avoid CORS errors:

```
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["localhost:*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["GET", "POST", "PUT"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'
```

## Troubleshooting

### Python 3

If you have Python 3 installed, you may see this error when installing dependencies:

```
gyp ERR! stack Error: Python executable "/Users/aiham/.pyenv/shims/python" is v3.6.4, which is not supported by gyp.
```

Resolve this by configuring npm to use Python 2 (where python2.7 is a binary accessible from your $PATH):

```
npm config set python python2.7
```

## Tests

When you begin developing, run `npm test` and keep it running while you develop.

View test results in your browser (with MetaMask installed and setup) at http://localhost:8081

Tests are automatically rerun when source or test code is changed.

Run a subset of tests using the `grep` query string parameter, for example: http://localhost:8081/?grep=IpfsService

## Documentation
Needed
