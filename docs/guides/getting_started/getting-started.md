---
layout: page
title: Getting Started
nav_weight: 3020
category: "Getting started"
---


### Download Origin

Origin.js is under active development. Our latest releases are available on our [Github](https://github.com/OriginProtocol).

### Use an Ethereum-enabled browser

For testing and interacting with your DApp, you will need to use a browser that supports Web3. We recommend using the [Metamask Chrome Browser Extension](https://metamask.io/). This will enable you to connect to the Ethereum network from your browser. Metamask allows you to run Ethereum DApps right in your browser without running a full Ethereum node.

Alternatively, you can run the official Ethereum browser [Mist](https://github.com/ethereum/mist).

On mobile, we recommend trying [Toshi](https://www.toshi.org/), [Cipher](https://www.cipherbrowser.com/) and [Trust Wallet](https://trustwalletapp.com/features/trust-browser).

### Acquire Test ETH

Our smart contracts are currently deployed on the `Rinkeby testnet`. You will need to have test ETH to use this library. You can request test funds from the [Rinkeby faucet](https://faucet.rinkeby.io/). Do not yet send real ETH on the Origin network. Use Rinkeby testnet ETH instead.

<aside class="notice">
Always confirm that you are on Rinkeby testnet when testing your DApp. Any Eth on mainnet that is sent to Origin contract addresses may be lost permanently.
</aside>

### Hello World

Simply include the downloaded javascript library in your html to get started. 

> Sample app

```html
<html>
<title>Hello World</title>
<body>
  <script type="text/javascript" src="origin.js"></script>
</body>
</html>
```

```javascript
const origin = new Origin();

const listingData = {
  name: "Kettlebell For Sale",
  category: "Health and Beauty",
  location: "San Fransisco, CA",
  description:
    "32kg gorilla kettlebell. Mint condition.",
  pictures: [],
  price: 0.134
}
const schema = "for-sale"
const transaction = await origin.listings.create(listingData, schema)
await origin.contractService.waitTransactionFinished(transaction.tx)
```