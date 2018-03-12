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

In the directory `./packages/contracts/` run:
```
truffle migrate
```
This will create the `.json` files for our solidity contracts. 

In the directory `./packages/origin.js` run:
```
npm link
```

Now change tabs (or diectories) to the repo for your DApp (for example, the [Origin demo-dapp](https://github.com/OriginProtocol/demo-dapp)) run:
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

## Tests
Needed

## Documentation
Needed
