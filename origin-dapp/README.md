![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)
[![origin_license](https://img.shields.io/badge/license-MIT-6e3bea.svg?style=flat-square&colorA=111d28)](https://github.com/OriginProtocol/origin/blob/master/origin-dapp/LICENSE)
[![origin_travis_banner](https://img.shields.io/travis/OriginProtocol/origin-dapp/master.svg?style=flat-square&colorA=111d28)](https://travis-ci.org/OriginProtocol/origin-dapp)

Head to https://www.originprotocol.com/developers to learn more about what we're building and how to get involved.

Just getting started with Origin? We recommend using [Origin Box](https://github.com/OriginProtocol/origin/tree/master/development#origin-box) for development and testing on your local machine.

# Origin Demo DApp
This is an example DApp (Decentralized Application) that shows how easy it is to create a truly peer to peer marketplace on the Ethereum blockchain with **origin-js**. Using only javascript, you can create and purchase listings, leave reviews, check identity, and more.

- [origin-js code](https://github.com/OriginProtocol/origin/tree/master/origin-js)
- [origin-js documentation](http://docs.originprotocol.com/)

To learn more about Origin Protocol, please read our [product brief](https://www.originprotocol.com/product-brief) and [whitepaper](https://www.originprotocol.com/whitepaper) for a high-level description of what we're building and why it matters. Our official website is [https://www.originprotocol.com](https://www.originprotocol.com).

## Try the DApp

 - [Mainnet](https://dapp.originprotocol.com). See [instructions](https://medium.com/originprotocol/draft-origin-launches-beta-on-mainnet-draft-e3b70161ae86).
 - [Testnet (Rinkeby network)](https://demo.staging.originprotocol.com)


## Run Demo DApp

### 1. Check node version

Make sure you have `node` version 10.0.0 or greater

```
node --version
```

### 2. Set up DApp

In a new tab:
```
git clone https://github.com/OriginProtocol/origin.git && cd origin/origin-dapp
npm install
npm run start
```

A browser will open to http://localhost:3000. If you don't have the MetaMask extension (or another wallet provider) follow instructions of the next step.

![Origin-homepage](https://user-images.githubusercontent.com/673455/39952325-6d37e3be-5551-11e8-9651-b1697bad3412.png)

### 3. Set up MetaMask

- Install [MetaMask Chrome Browser Extension](https://metamask.io/).

- Follow the instructions to set up your wallet.

- Click where it says "Ethereum Main Network" and select "Rinkeby Test Network" or "Ropsten Test Network". This takes us off of the real Ethereum network and onto a test network. Ethers on test networks cannot be exchanged for fiat currency.

**Be careful not to mix up your test wallet with your real one on the Main Network.**

### 4. Get test ether

Get Rinkeby ether from the [Rinkeby faucet](https://faucet.rinkeby.io/).

### 5. Try it!
Create a listing and post it to IPFS and Ethereum.

## Run Demo DApp with local origin-js and local blockchain

If you want to hack on origin-js code, or if you just want to use a private local blockchain, follow these instructions.

### 1. Set up and run origin-js locally

[Follow these instructions to setup and run origin-js.](https://github.com/OriginProtocol/origin/tree/master/origin-js#local-development)

### 2. Set up the DApp for local development

Leave origin-js running and create a new terminal window. Then run the following:
```bash
cd origin/origin-dapp
cp dev.env .env  # Use development env vars
npm run start
```

Your browser will open to [http://localhost:3000](http://localhost:3000) and display the DApp.

### 3. Connect to your local blockchain in MetaMask

-  Log out of MetaMask.

- Click `Restore from seed phrase`

- Enter the following seed phrase (Mnemonic):
```
candy maple cake sugar pudding cream honey rich smooth crumble sweet treat
```
This is the default seed phrase used by [Truffle](https://github.com/trufflesuite/truffle) for development.

 ⚠️ Be careful not to mix up your test wallet with your real one on the Main Network.

- Click where it says "Ethereum Main Network" and select "Localhost 8545". Click the back arrow to return to your account.

- You should see your first test account now has 100 ETH and the address `0x627306090abaB3A6e1400e9345bC60c78a8BEf57`. Additional generated accounts will also have this amount.

## Browser & Wallet Compatibility
Browsers with wallets for both desktop and mobile that you can use with the Origin Demo DApp.


| OS | Application | Status | Notes |
| ---- | -------- | ------ | ------ |
| Mac | Chrome + MetaMask extension | ✅ | Operational |
| Mac | Firefox + MetaMask extension | ✅  | Operational |
| Mac | Opera with MetaMask | ⚪️ | Not tested |
| Mac | Brave with MetaMask | ✅ | Operational |
|  | |  |
| PC | Chrome + MetaMask extension | ✅ | Operational |
| PC | Firefox + MetaMask extension | ✅ | Operational |
| PC | Opera with MetaMask | ✅ | Operational |
| PC | Brave with MetaMask | ✅ | Operational |
|  |  |  |
| iOS | Trust Wallet | ✅  | Operational |
| iOS | Coinbase Wallet  |  🚫  |  |
| iOS | Coinbase Wallet Developer  |  🚫  |  [DApp hangs on Toshi client #327](https://github.com/OriginProtocol/origin-dapp/issues/327) |
| iOS | Cipher  | ⛔️  | Acquired by Coinbase. Not in development. |
|   |  |  |
| Android | Trust Wallet | 🚫 | [Dapp hang + app does not currently work with test nets](https://github.com/OriginProtocol/origin-dapp/issues/331#issuecomment-416364784) |
| Android | Coinbase Wallet  |  ✅ |  Operational |
| Android | Coinbase Wallet Developer  |  🚫 | Toshi Developer app does not currently work with test nets |
| Android | Cipher  |  ⛔️  | Not in development |

<sup>Tests for http://demo.originprotocol.com</sup>

## Localization
See [translations](translations) directory.

## Deploy on Heroku or IPFS

To deploy a development copy of the site on Heroku, follow the instructions:
```
git clone https://github.com/OriginProtocol/origin.git && cd origin
git subtree push --prefix origin-dapp heroku master
```

You will need to set some configuration variable for your Heroku deployment. We recommend using the same configuration as our Rinkeby testnet deployment. See https://demo.staging.originprotocol.com/#/app-info

Since this app is just a bunch of HTML and JavaScript, you can also deploy and use it directly from IPFS. Just run:

```
cd origin-dapp/script
./scripts/deploy-ipfs.sh
```

## Contributing

Origin is an 100% open-source and community-driven project and we welcome contributions of all sorts. There are many ways to help, from reporting issues, contributing code, and helping us improve our community.

To get involved, please review our [guide to contributing](https://www.originprotocol.com/developers).
