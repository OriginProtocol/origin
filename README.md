# Origin
The sharing economy without intermediaries.

## Project Overview

Origin is a sharing economy marketplace that enables buyers and sellers of fractional use goods and services (car-sharing, service-based tasks, home-sharing, etc.) to transact on the distributed, open web. Using the Ethereum blockchain and Interplanetary File System (IPFS), the platform and community are decentralized, allowing for the creation and booking of services and goods without traditional intermediaries.

We are specifically building a large-scale commerce network that:
* Transfers direct financial value (listing, transaction, and service fees) from large corporations like Airbnb, Craigslist, Postmates, etc. to individual buyers and sellers
* Transfers indirect financial and strategic value (privately aggregated silos of customer and transaction data) from those same corporations to the entire ecosystem
* Creates new financial value for marketplace participants that contribute to the growth of the network (e.g. building new technology for the Origin network, bootstrapping new product verticals, and referring new users and businesses)
* Is built on an open, distributed, and shared data layer to promote transparency and collaboration
* Immediately allows buyers and sellers across the world to do business with each other without difficult currency conversions or tariffs
* Promotes personal liberty by not allowing a central corporation or government to impose arbitrary and oftentimes onerous rules on how to do business

To accomplish these ambitious goals, the Origin platform is being launched with incentives from the outset to encourage other technologists, businesses, and consumers to build, contribute, and extend the ecosystem with us. We imagine a broad collection of vertical use cases (e.g short-term vacation rentals, freelance software engineering, tutoring for hire) that are built on top of Origin standards and shared data. Together, we will create the Internet economy of tomorrow.

To learn more about this project, please visit [the Origin website](https://www.originprotocol.com) and download our whitepaper.

## Try Demo Dapp on the Rinkeby testnet

This demo is currently running on the Rinkeby testnet.
- [Overview and step-by-step instructions](https://medium.com/originprotocol/origin-demo-dapp-is-now-live-on-testnet-835ae201c58) 
- [Live Demo](http://demo.originprotocol.com)


## Core Technologies

If you're new to the space, it may be helpful to first familiarize yourself with some of the core technologies that we're using to build Origin.

 * [JSON Schema](http://json-schema.org/)
 * [IPFS](https://ipfs.io/)
 * [Ethereum](https://www.ethereum.org/)

## Install and run Demo DApp locally

Think of this app as a proof of concept and our playground for trying out ideas. While we may eventually reuse pieces of this in production, this is by no means what we envision as the final product. We thought it would be helpful to demonstrate how the various technologies work together from end to end.


1. Download [truffle](http://truffleframework.com/):
```
npm install -g truffle
```
2. Clone Origin:
```
git clone https://github.com/OriginProtocol/demo-dapp origin-demo-dapp && cd origin-demo-dapp
```
3. Start truffle:
```
truffle develop
```
 This will begin a new Ethereum blockchain. It will output 10 accounts that it has put 100 ETH into, and the mnemonic to generate them.

4. In the truffle console, type `migrate`. This will compile our contracts and add them to the blockchain.

5. Install [Metamask Chrome Browser Extension](https://metamask.io/).

6. Click the Metamask icon in the toolbar, accept terms, and then click `Import Existing DEN`

7. Enter the seed phrase (Mnemonic):
```
candy maple cake sugar pudding cream honey rich smooth crumble sweet treat
```
 This is the default seed phrase for truffle development.

8. Click where it says "Ethereum Main Network", select "Custom RPC" and enter `http://localhost:9545/`. This takes us off of the real ETH blockchain and onto our local blockchain. Click the back arrow to return to your account.

 **Be careful not to mix up your test wallet with you real one on the Main Network.**

9. You should see your first test account now has 100 ETH. (Address of `0x627306090abaB3A6e1400e9345bC60c78a8BEf57`) Additional generated accounts will also have this amount.

10. In a new terminal tab, install and start the Origin node application.
```
npm install
npm run start
```

11. A browser will open to http://localhost:3000
![Origin-homepage](https://user-images.githubusercontent.com/673455/34650232-ca4df39c-f37a-11e7-9b18-18861f282dff.png)

12. Try it! Create a listing and post it to IPFS and Ethereum.

## Get involved

We'd love to have you join us on this project.  We're still in the super early stages, but join our [slack channel](http://slack.originprotocol.com) or [email us](mailto:founders@originprotocol.com) to get started.
