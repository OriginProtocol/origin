# Getting started

### Download Origin

Origin.js is under active development. Our upcoming 0.1 release will be available at our [Github repo](https://github.com/OriginProtocol/origin-js) soon.

### Use an Ethereum browser

For testing and interacting with your DApp, you will need to use an Ethereum-enabled browser. Currently, we recommend using Metamask with Chrome.

Install the [Metamask Chrome Browser Extension](https://metamask.io/). This will enable you to connect to the Ethereum network from your browser. Metamask allows you to run Ethereum DApps right in your browser without running a full Ethereum node.

Alternatively, you can run the official Ethereum browser [Mist](https://github.com/ethereum/mist).

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
var origin = new Origin();

var user = new User();
user.name = "Joe"

var listing = new Listing();
listing.owner = user

listing.save()

```