![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

# Origin Demo DApp
This is an example DApp (Decentralized Application) that shows how easy it is to create a truly peer to peer marketplace on the Ethereum blockchain. It showcases the power of [origin.js](https://github.com/OriginProtocol/origin-js). Using only javascript, you can search listings, create listings, purchase listings, and more. 

Documentation for origin.js is located here: http://docs.originprotocol.com/

To learn more about this project, please visit [the Origin website](https://www.originprotocol.com) and read our [product brief](https://www.originprotocol.com/product-brief) and [whitepaper](https://www.originprotocol.com/whitepaper) for a high-level description of what we're building and why it matters.

*NOTE:* This project is under rapid development. 

## Try Demo Dapp on the Rinkeby testnet

This demo is currently running on the Rinkeby testnet. (Note that this demo is slightly behind the current state of this repo.) 
- [Overview and step-by-step instructions](https://medium.com/originprotocol/origin-demo-dapp-is-now-live-on-testnet-835ae201c58)
- [Live Demo](http://demo.originprotocol.com)

## Install and run Demo DApp locally

### 1. Check node version

Make sure you have `node` version 8.5.0 or greater

```
node --version
```

### 2. Set up the dapp

In a new tab:
```
git clone https://github.com/OriginProtocol/demo-dapp origin-demo-dapp && cd origin-demo-dapp
npm install
npm run start
```

A browser will open to http://localhost:3000. You're not quite done though! You'll need metamask if you don't already have it. See next step.

![Origin-homepage](https://user-images.githubusercontent.com/673455/39952325-6d37e3be-5551-11e8-9651-b1697bad3412.png)

### 3. Set up Metamask

  -  Install [Metamask Chrome Browser Extension](https://metamask.io/).

  - Follow the instructions to set up your wallet.

  - Click where it says "Ethereum Main Network" and select "Rinkeby". This takes us off of the real ETH blockchain and onto the Rinkeby test net.

   **Be careful not to mix up your test wallet with your real one on the Main Network.**

### 4. Get some test ether

   - To get some Rinkeby ETH for creating or purchasing listings, visit the [this faucet](https://faucet.rinkeby.io/).

### 4. Try it!
Create a listing and post it to IPFS and Ethereum.


## Developing with a local chain

By default, this demo will connect to the global test networks of Rinkeby or Ropsten. For development, you may wish to connect to a local blockchain running on your local machine. 

### 1. Set up and run *origin.js* locally

[Follow these instructions to setup and run origin.js.](https://github.com/OriginProtocol/origin-js#local) Origin.js is needed to run a local blockchain and make it accessible to your dapp.

### 2. Set up the dapp

In a separate tab:
```
git clone https://github.com/OriginProtocol/demo-dapp origin-demo-dapp && cd origin-demo-dapp
npm run install:dev
npm run start
cp .env.dev .env
```

The `install:dev` script performs the regular install and then links to your local origin.js.

### 3. Connect to your local blockchain in Metamask

-  Install [Metamask Chrome Browser Extension](https://metamask.io/).

- Click the Metamask icon in the toolbar, accept terms, and then click `Import Existing DEN`

- Enter the seed phrase (Mnemonic):
```
candy maple cake sugar pudding cream honey rich smooth crumble sweet treat
```
This is the default seed phrase for truffle development.

- Click where it says "Ethereum Main Network" and select "Localhost 8545". Click the back arrow to return to your account.

 **Be careful not to mix up your test wallet with your real one on the Main Network.**

- You should see your first test account now has 100 ETH. (Address of `0x627306090abaB3A6e1400e9345bC60c78a8BEf57`) Additional generated accounts will also have this amount.

## Hosting on a server

If you want to host the demo dapp on web server such as EC2 you will need to configure things differently. Browsers can not connect to a test chain on the EC2 server, so you will need to connect to our existing contracts on the test networks or deploy your own.

To use the contracts deployed by Origin, modify the file `build/contracts/Listing.json` and add lines to the `networks` entry so it begins like this:
```
  "networks": {
    "3": {
      "events": {},
      "links": {},
      "address": "0xe66c9c6168d14be4c3c145f91890740cbdf9ec8b"
    },
    "4": {
      "events": {},
      "links": {},
      "address": "0x94de52186b535cb06ca31deb1fbd4541a824ac6d"
    },
    <...Possibly other networks for local test chains>
```
(Ropsten test network is id 3, and Rinkeby test netork is id 4)

## Contributing

Origin is an 100% open-source and community-driven project and we welcome contributions of all sorts. There are many ways to help, from reporting issues, contributing code, and helping us improve our community. To get involved, please join our [Discord channel](https://discord.gg/jyxpUSe) and review our [guide to contributing](https://docs.originprotocol.com/#contributing).
