![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)
![origin_travis_banner](https://travis-ci.org/OriginProtocol/origin-dapp.svg?branch=master)

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

A browser will open to http://localhost:3000. If you don't have the MetaMask extension (or another wallet provider) follow instructions of the next step.

![Origin-homepage](https://user-images.githubusercontent.com/673455/39952325-6d37e3be-5551-11e8-9651-b1697bad3412.png)

### 3. Set up MetaMask

- Install [MetaMask Chrome Browser Extension](https://metamask.io/).

- Follow the instructions to set up your wallet.

- Click where it says "Ethereum Main Network" and select "Rinkeby Test Network" or "Ropsten Test Network". This takes us off of the real Ethereum network and onto a test network. Ethers on test networks cannot be exchanged for fiat currency.

**Be careful not to mix up your test wallet with your real one on the Main Network.**

### 4. Get test ether

- Get Rinkeby ether from the [Rinkeby faucet](https://faucet.rinkeby.io/).
- Get Ropsten ether from the [Ropsten faucet](https://faucet.metamask.io/).

### 4. Try it!
Create a listing and post it to IPFS and Ethereum.

## Run Demo DApp with local origin-js and local blockchain

If you want hack on origin-js code, or if you just want to use a private local blockchain, follow these instructions.

### 1. Set up and run origin-js locally

[Follow these instructions to setup and run origin-js.](https://github.com/OriginProtocol/origin-js#local-development)

### 2. Set up the DApp for local development

Leave origin-js running and create a new terminal window. Then run the following:
```bash
git clone https://github.com/OriginProtocol/demo-dapp origin-demo-dapp && cd origin-demo-dapp
cp dev.env .env  # Use development env vars
npm run install:dev
npm run start
```

The `install:dev` script performs the regular install and then links to your local origin-js from step 1. Changes made to origin-js code will then immediately reflected in Demo DApp without requiring `npm install`.

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

## Localization
See [translations](translations) directory.

## Deploy on Heroku or IPFS

To deploy a development copy of the site on Heroku, choose which branch you would like to use and follow the instructions:

| `Master` branch <br>(stable) | `Develop` branch<br> (active development) |
|---------|----------|
| [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/originprotocol/demo-dapp/tree/master) | [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/originprotocol/demo-dapp/tree/develop) |

Heroku will prompt you to set some config variables. You will likely want to stick with the defaults which use [Origin's IPFS Gateway](https://gateway.originprotocol.com) and [Bridge Server](https://github.com/originprotocol/origin-bridge). We also recommend using [Infura](https://infura.io/) for connecting to Ethereum even when visitors don't have web3-enabled browsers.

Since this app is just a bunch of HTML and JavaScript, you can also deploy and use it directly from IPFS. Just run:

`./scripts/deploy.sh`

## Contributing

Origin is an 100% open-source and community-driven project and we welcome contributions of all sorts. There are many ways to help, from reporting issues, contributing code, and helping us improve our community.

To get involved, please join our [Discord channel](https://discord.gg/jyxpUSe) and review our [guide to contributing](https://docs.originprotocol.com/#contributing).
