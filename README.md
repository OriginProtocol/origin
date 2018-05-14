![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

# Origin Demo DApp
This is an example DApp (Decentralized Application) that shows how easy it is to create a truly peer to peer marketplace on the Ethereum blockchain with **origin-js**. Using only javascript, you can create and purchase listings, leave reviews, check identity, and more.

- [origin-js repo](https://github.com/OriginProtocol/origin-js)
- [origin-js documentation](http://docs.originprotocol.com/)

To learn more about Origin Protocol, please read our [product brief](https://www.originprotocol.com/product-brief) and [whitepaper](https://www.originprotocol.com/whitepaper) for a high-level description of what we're building and why it matters. Our official website is [https://www.originprotocol.com](https://www.originprotocol.com).

## Try Demo Dapp on the Rinkeby testnet

This demo is currently running on the Rinkeby testnet. (Note that this demo is slightly behind the current state of this repo.) 
- [Overview and step-by-step instructions](https://medium.com/originprotocol/origin-demo-dapp-is-now-live-on-testnet-835ae201c58)
- [Live Demo](http://demo.originprotocol.com)

## Run Demo DApp

### 1. Check node version

Make sure you have `node` version 8.5.0 or greater

```
node --version
```

### 2. Set up DApp 

In a new tab:
```
git clone https://github.com/OriginProtocol/demo-dapp origin-demo-dapp && cd origin-demo-dapp
npm install
npm run start
```

A browser will open to http://localhost:3000. If you don't have the MetaMask extension (or another wallet provider) proceed to the next step.

![Origin-homepage](https://user-images.githubusercontent.com/673455/34650232-ca4df39c-f37a-11e7-9b18-18861f282dff.png)

### 3. Set up Metamask

- Install [MetaMask Chrome Browser Extension](https://metamask.io/).

- Follow the instructions to set up your wallet.

- Click where it says "Ethereum Main Network" and select "Rinkeby Test Netowrk" or "Ropsten Test Network". This takes us off of the real Ethereum network and onto a test network. Ethers on test networks cannot be exchanged for fiat currency.

**Be careful not to mix up your test wallet with your real one on the Main Network.**

### 4. Get test ether

- Get Rinkeby ether at [this faucet](https://faucet.rinkeby.io/).
- Get Ropsten ether at [this faucet](https://faucet.metamask.io/).

### 4. Try it!
Create a listing and post it to IPFS and Ethereum.

## Run Demo DApp with local origin-js and local blockchain

If you want hack on origin-js code, or if you just want to use a private local blockchain, follow these instructions.

### 1. Set up and run origin-js locally

[Follow these instructions to setup and run origin.js.](https://github.com/OriginProtocol/origin-js#local-development) `origin-js` is needed to run a local blockchain and make it accessible to your DApp.

### 2. Set up the DApp for local development

Leave origin-js running and create a new terminal window. Then run the following:
```
git clone https://github.com/OriginProtocol/demo-dapp origin-demo-dapp && cd origin-demo-dapp
npm run install:dev
npm run start
cp .env.dev .env
```

The `install:dev` script performs the regular install and then links to your local origin-js. Changes made to origin-js code will be immediately reflected in Demo DApp without requiring `npm install`. 

### 3. Connect to your local blockchain in Metamask

-  Install [MetaMask Chrome Browser Extension](https://metamask.io/).

- Click the MetaMask icon in the toolbar, accept terms, and click `Import Existing DEN`

- Enter this seed phrase (Mnemonic):
```
candy maple cake sugar pudding cream honey rich smooth crumble sweet treat
```

This is a standard seed phrase for development. (Used by [Truffle](https://github.com/trufflesuite/truffle))

**Be careful not to mix up your test wallet with your real one on the Main Network.**

- Click where it says "Ethereum Main Network" and select "Localhost 8545" to use your local blockchain. 

- You should see your first test account now has 100 ETH. (Address of `0x627306090abaB3A6e1400e9345bC60c78a8BEf57`) Additional generated accounts will also have this amount.


## Contributing

Origin is an 100% open-source and community-driven project and we welcome contributions of all sorts. There are many ways to help, from reporting issues, contributing code, and helping us improve our community. 

To get involved, please join our [Discord channel](https://discord.gg/jyxpUSe) and review our [guide to contributing](https://docs.originprotocol.com/#contributing).
