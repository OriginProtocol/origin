![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

![origin_npm_version](https://img.shields.io/npm/v/@originprotocol/origin.svg) ![origin_license](https://img.shields.io/npm/l/@originprotocol/origin.svg)

# Origin Platform

Origin Protocol is a library of javascript code and Ethereum smart contracts which allow anyone to create decentralized marketplaces, including for fractional usage.

Please refer to our [product brief](https://www.originprotocol.com/product-brief) and [technical whitepaper](https://www.originprotocol.com/whitepaper) for more detail.

 - [README for Javascript code](#originjs-documentation)

## Follow our progress and get involved

This repo is under active development. We welcome your participation!

1. [Join our #engineering channel on Discord](http://www.originprotocol.com/discord).

2. Listen in on our weekly engineering call on Google Hangouts. It happens every week and everyone is welcome to listen in and participate. [Join us on Google Hangouts](https://meet.google.com/pws-cgyd-tqp) on Wednesdays at 9pm GMT ([Add to Calendar](https://calendar.google.com/event?action=TEMPLATE&tmeid=MHAyNHI3N2hzMjk5b3V2bjhoM2Q1ZWVzY2pfMjAxODA0MTFUMjAwMDAwWiBqb3NoQG9yaWdpbnByb3RvY29sLmNvbQ&tmsrc=josh%40originprotocol.com&scp=ALL)):

> | Pacific | Mountain | Central | Eastern | GMT |
> |---------|----------|---------|---------|-----|
> | Wed 1pm | Wed 2pm | Wed 3pm | Wed 4pm | Wed 9pm |

3. Catch up on our meeting notes & weekly sprint planning docs (feel free to add comments):
- [Engineering meeting notes](https://docs.google.com/document/d/1aRcAk_rEjRgd1BppzxZJK9RXfDkbuwKKH8nPQk7FfaU/)
- [Weekly sprint doc](https://docs.google.com/document/d/1qJ3sem38ED8oRI72JkeilcvIs82oDq5IT3fHKBrhZIM)

4. Read our simple [contributing and style guide](CONTRIBUTING.md).

# What we're building

This library is an abstraction layer for developers who want to build DApps on Origin Protocol, and is also used to build the [Origin Demo DApp](https://github.com/OriginProtocol/demo-dapp).

The library will make it easy for sellers to do things like:

 - Create listings
 - Update listings
 - Delete listings
 - Validate listings

And buyers to:

 - Browse listing
 - Create bookings
 - Update bookings
 - Cancel bookings

 # origin.js Documentation

 ## Introduction

 Welcome to the origin.js documentation! origin.js is a Javascript library for interacting with the Origin protocol.

 Using the library you can create new listings from your applications, purchase them, or update them from your own off-chain applications.

 ### Warning
 This is still an alpha version which will evolve significantly before the main net release.

 ## Using origin.js in your project

 ### Plain javascript

 A browser-compatible plain javascript file `origin.js` is available in the "Releases" tab, and will soon be hosted on originprotocol.com. It can be generated locally via `npm build` and will be placed in `dist/origin.js`.

 ## Install

 ### NPM
 ```
 npm install @originprotocol/origin --save
 ```

 ### Yarn
 ```
 yarn add @originprotocol/origin
 ```

 ### Local

1. Clone
```
git clone https://github.com/OriginProtocol/platform origin-platform && cd origin-platform
```

2. Install:dev (shortcut for `npm install && npm link`). Linking makes this available as a local npm package for local dapp development.
 ```
 npm run install:dev
 ```

3. Start the localblockchain and create the build. Code changes will trigger a live rebuild.
 ```
 npm start
 ```

 4. To develop against a working dapp and UI, see [the instructions in our demo dapp](https://github.com/OriginProtocol/demo-dapp#developing-with-a-local-chain).

 ## Import

 ```
 import Origin from '@originprotocol/origin'

 let configOptions = {}

 let { contractService, ipfsService, originService } = new Origin(configOptions)
 ```

 ## Configuration Options

 Config options are passed into the Origin constructor at instantiation.

 ```
 let configOptions = {
   option: 'value'
 }
 let origin = new Origin(configOptions)
 ```

 Valid options:
 - `ipfsDomain`
 - `ipfsApiPort`
 - `ipfsGatewayPort`
 - `ipfsGatewayProtocol`

 ## IPFS

 If you are running a local IPFS daemon then set the following config options ([see config options](#configuration-options)):

 ```
 {
   ipfsDomain: '127.0.0.1',
   ipfsApiPort: '5001',
   ipfsGatewayPort: '8080',
   ipfsGatewayProtocol: 'http'
 }
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

 ### Command Line Tests

Our full test suite can be run with:

 ```
 npm run test
 ```

 Note: you should *not* have the server running at this time, as these tests start their own local blockchain instance.

 ### Browser Tests

 A subset of our tests can be run from the browser. These tests are automatically served at `http://localhost:8081` when you run `npm start`. These tests are automatically rerun when source or test code is changed.

 Run a subset of these tests using the `grep` query string parameter, for example: http://localhost:8081/?grep=IpfsService

 ## Documentation

 Needed
