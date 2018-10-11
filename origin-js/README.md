![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

![origin_npm_version](https://img.shields.io/npm/v/origin.svg?style=flat-square&colorA=111d28&colorB=1a82ff)
[![origin_license](https://img.shields.io/badge/license-MIT-6e3bea.svg?style=flat-square&colorA=111d28)](https://github.com/OriginProtocol/origin-js/blob/master/LICENSE)
[![origin_travis_banner](https://img.shields.io/travis/OriginProtocol/origin-js/master.svg?style=flat-square&colorA=111d28)](https://travis-ci.org/OriginProtocol/origin-js)

Head to https://www.originprotocol.com/developers to learn more about what we're building and how to get involved.

# origin-js

origin-js is a library of javascript code and Ethereum smart contracts which allow anyone to create decentralized marketplaces, including for fractional usage. It is an open source project created by [Origin Protocol](https://www.originprotocol.com/).

⚠️ This is an alpha version which is not suitable for production environments.

## Documentation
[origin-js documentation](http://docs.originprotocol.com/)

## Demo

origin-js is showcased in our Demo DApp currently running on the Rinkeby testnet.
- [Overview and step-by-step instructions](https://medium.com/originprotocol/origin-demo-dapp-is-now-live-on-testnet-835ae201c58)
- [Live Demo](http://demo.originprotocol.com)
- [Github Repo](https://github.com/OriginProtocol/demo-dapp)

## Using origin-js in your project

### As a node package

```
npm install origin --save
```
or
```
yarn add origin
```

### Plain javascript

A browser-compatible plain javascript file `origin.js` is available in the [Releases section](https://github.com/OriginProtocol/origin-js/releases). A hosted version can be directly included in your html as:
```html
<script src="https://code.originprotocol.com/origin-js/origin-v0.7.1.js"></script>
```

`npm build` will generate this file and save it to `dist/origin.js`.

## Local development

### Fully integrated with [origin-dapp](https://github.com/OriginProtocol/origin-dapp) and [origin-bridge](https://github.com/OriginProtocol/origin-bridge)

We recommend using [Origin Box](https://github.com/OriginProtocol/origin-box) for development and testing on your local machine. This saves you the headache of spinning up several environments and running multiple, different processes.

### Without [origin-bridge](https://github.com/OriginProtocol/origin-bridge)

1.  Clone this repo.
```
git clone https://github.com/OriginProtocol/origin-js.git && cd origin-js
```

1.  Install dependencies and link by running `npm run install:dev`. This script is a shortcut for `npm install && npm link`. Linking means that changes to `origin-js` code are immediately available to local DApps without an `npm install`.

1.  Start the local blockchain and build origin-js by running `npm start`. Code changes will trigger a live rebuild.

1.  To interact with your local origin-js and local blockahin, see [the instructions in our Demo DApp](https://github.com/OriginProtocol/origin-dapp#run-demo-dapp-with-local-origin-js-and-local-blockchain).


## Tests

### Command Line (All Tests)

Our full test suite can be run with:

```
npm run test
```

 Note: you should *not* have the server running at this time, as these tests start their own local blockchain instance.

### Command Line (Non-Solidity Tests)

To run non-contract tests (`test/**.js`):

```
npm run test:js
```

To run non-contract tests and automatically re-run when files change:
```
npm run test:jsw
```


### Command Line (Only Solidity Tests)

Our Solidity tests (which use [Truffle](http://truffleframework.com/docs/getting_started/javascript-tests)) are located at `contracts/test`.

 ```
 npm run test:contracts
 ```

Note: you should *not* have the server running at this time, as these tests start their own local blockchain instance.

To run contract tests and automatically re-run when files change:

```
npm run test:contractsw
```

To run contract tests and measure test coverage of Solidity code:

```
npm run test:contracts-coverage
```

### Browser Tests

A subset of our tests can be run from the browser. These tests are automatically served at `http://localhost:8081` when you run `npm start`. These tests are automatically rerun when source or test code is changed.

Run a subset of these tests using the `grep` query string parameter, for example: http://localhost:8081/?grep=IpfsService

## Using the Ganache GUI

By default, starting origin-js locally starts [ganache-cli](https://github.com/trufflesuite/ganache-cli) automatically.
However, for development you might want to connect to the [GUI version of Ganache](http://truffleframework.com/ganache/). This provides a nice interface for browsing your local blockchain activity and can be useful for debugging.

To use the Ganache GUI:
1. [Install Ganache](http://truffleframework.com/ganache/)
1. Start Ganache
1. Navigate to the settings in Ganache (click on the gear in the upper right-hand corner)
1. Set `Port Number` to `8545`
1. Set `Network ID` to `999`
1. Under the `Accounts & Keys` tab, set the mnemonic to `candy maple cake sugar pudding cream honey rich smooth crumble sweet treat`
1. When starting origin-js locally, run `npm run start:no-ganache` (instead of `npm run start`)

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

## Contributing

Origin is an 100% open-source and community-driven project and we welcome contributions of all sorts. There are many ways to help, from reporting issues, contributing code, and helping us improve our community.

To get involved, please join our [Discord channel](https://discord.gg/jyxpUSe) and review our [guide to contributing](https://docs.originprotocol.com/#contributing).
