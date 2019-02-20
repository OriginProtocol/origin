![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)
[![origin_license](https://img.shields.io/badge/license-MIT-6e3bea.svg?style=flat-square&colorA=111d28)](https://github.com/OriginProtocol/origin/blob/master/origin-dapp/LICENSE)

Head to https://www.originprotocol.com/developers to learn more about what we're building and how to get involved.

Just getting started with Origin? We recommend using [Origin Box](https://github.com/OriginProtocol/origin/tree/master/development#origin-box) for development and testing on your local machine.

# Origin DApp

This is an example DApp (Decentralized Application) that shows how easy it is to create a truly peer to peer marketplace on the Ethereum blockchain with **origin-js**. Using only javascript, you can create and purchase listings, leave reviews, check identity, and more.

- [origin-js code](https://github.com/OriginProtocol/origin/tree/master/origin-js)
- [origin-js documentation](http://docs.originprotocol.com/)

To learn more about Origin Protocol, please read our [product brief](https://www.originprotocol.com/product-brief) and [whitepaper](https://www.originprotocol.com/whitepaper) for a high-level description of what we're building and why it matters. Our official website is [https://www.originprotocol.com](https://www.originprotocol.com).

## Try the DApp

 - [Mainnet](https://dapp.originprotocol.com). See [instructions](https://medium.com/originprotocol/draft-origin-launches-beta-on-mainnet-draft-e3b70161ae86).
 - [Testnet (Rinkeby network)](https://demo.staging.originprotocol.com)

To use the DApp you will need to install and configure the [MetaMask browser extension](https://metamask.io). Once you have set up a wallet you will need to make sure that you have selected the correct Ethereum network depending on which version of the DApp you are using.

If you are running on Rinkeby you can get test Ether from the [Rinkeby faucet](https://faucet.rinkeby.io). You can also get test OGN tokens from the [Origin faucet](https://faucet.staging.originprotocol.com).

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
| iOS | Trust Wallet | ✅ | Operational |
| iOS | Coinbase Wallet | ✅ | Operational |
| iOS | IMToken | ✅ | Operational |
| iOS | Cipher | ⛔️ | Acquired by Coinbase. Not in development. |
|   |  |  |
| Android | Trust Wallet | 🚫 | [Dapp hang + app does not currently work with test nets](https://github.com/OriginProtocol/origin-dapp/issues/331#issuecomment-416364784) |
| Android | Coinbase Wallet  |  ✅ |  Operational |
| Android | Cipher  |  ⛔️  | Not in development |

<sup>Tests for http://demo.originprotocol.com</sup>

## Localization

See [translations](translations) directory.

## Contributing

Origin is an 100% open-source and community-driven project and we welcome contributions of all sorts. There are many ways to help, from reporting issues, contributing code, and helping us improve our community.

To get involved, please review our [guide to contributing](https://www.originprotocol.com/developers).
