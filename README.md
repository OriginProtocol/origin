![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

![origin_npm_version](https://img.shields.io/npm/v/origin.svg?style=flat-square&colorA=111d28&colorB=1a82ff) 
![origin_license](https://img.shields.io/badge/license-MIT-6e3bea.svg?style=flat-square&colorA=111d28)
![origin_travis_banner](https://img.shields.io/travis/OriginProtocol/origin-js/master.svg?style=flat-square&colorA=111d28)

# origin-js

origin-js is a library of javascript code and Ethereum smart contracts which allow anyone to create decentralized marketplaces, including for fractional usage. It is an open source project created by [Origin Protocol](https://www.originprotocol.com/). 

To learn more about Origin Protocol, please read our [product brief](https://www.originprotocol.com/product-brief) and [whitepaper](https://www.originprotocol.com/whitepaper) for a high-level description of what we're building and why it matters. Our official website is [https://www.originprotocol.com](https://www.originprotocol.com).

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
<script src="https://code.originprotocol.com/origin-js/origin-v0.6.1.js"></script>
```

`npm build` will generate this file and save it to `dist/origin.js`.

## Local development

### 1. Clone this repo.
```
git clone https://github.com/OriginProtocol/origin-js.git && cd origin-js
```

If you would like to submit pull requests, you should instead fork this repo and then clone your fork. Note pull requests should always be made to the `develop` branch, which always has the latest commits.

### 2. Install dependencies and link
```
npm run install:dev
```

`install:dev` is shortcut for `npm install && npm link`. Linking means that changes to `origin-js` code are immediately available to local DApps without an `npm install`. 

### 3. Start the local blockchain and build origin-js

```
npm start
```

Code changes will trigger a live rebuild.
    
### 4. Use with local Demo DApp

To interact with your local origin-js and local blockahin, see [the instructions in our Demo DApp](https://github.com/OriginProtocol/demo-dapp#developing-with-a-local-chain).


## Tests

### Command Line (All Tests)

Our full test suite can be run with:

```
npm run test
```

 Note: you should *not* have the server running at this time, as these tests start their own local blockchain instance.

 ### Command Line (Only Solidity Tests)

Our Solidity tests (which use [Truffle](http://truffleframework.com/docs/getting_started/javascript-tests)) are located at `contracts/test`.

 ```
 npm run test:contracts
 ```

Note: you should *not* have the server running at this time, as these tests start their own local blockchain instance.

### Browser Tests

A subset of our tests can be run from the browser. These tests are automatically served at `http://localhost:8081` when you run `npm start`. These tests are automatically rerun when source or test code is changed.

Run a subset of these tests using the `grep` query string parameter, for example: http://localhost:8081/?grep=IpfsService

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
