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

## Tests

When you begin developing, run `npm test` and keep it running while you develop.

View test results in your browser (with MetaMask installed and setup) at http://localhost:8081

Tests are automatically rerun when source or test code is changed.

## Documentation
Needed
