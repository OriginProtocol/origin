# Origin
The sharing economy without intermediaries.

## Overview

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

## In this repo

This repo will be the home for all the various components of the Origin platform.  Including:

* Common base schemas that will be used frequently & can be inherited (email addresses, international addresses, phone numbers, etc.)
* Vertical-specific schemas like home-sharing, car-sharing, services, etc.
* An Origin dApp for publishing new listings, or searching or booking existing listings
* Our Ethereum smart contracts
* Backend service that fetches listings and makes them searchable
* The originprotocol.com landing page
* Other tools like validators, notification apps, etc.

## Getting up to speed

If you're new to the space, it may be helpful to first familiarize yourself with some of the core technologies that we're using to build Origin.

 * [JSON Schema](http://json-schema.org/)
 * [IPFS](https://ipfs.io/)
 * [Ethereum](https://www.ethereum.org/)

## Install and run the demo app

Think of this app as a proof of concept and our playground for trying out ideas. While we may eventually reuse pieces of this in production, this is by no means what we envision as the final product. We thought it would be helpful to demonstrate how the various technologies work together from end to end.

1. Install [Metamask Chrome Browser Extension](https://metamask.io/).

2. Download Ethereum [test-rpc](https://github.com/ethereumjs/testrpc) and [truffle](http://truffleframework.com/):
```
npm i -g ethereumjs-testrpc
npm install -g truffle
```
3. Clone Origin:
```
git clone https://github.com/OriginProtocol/demo-dapp origin-demo-dapp
cd origin-demo-dapp
```
4. Start testrpc:
```
testrpc --mnemonic="Origin Demo" --accounts=3
```
This will begin a new Ethereum blockchain, and output credentials for 3 test wallets with 100 ETH. The `mnemonic` causes the same accounts to be generated each time.

5. In a new terminal tab, compile the smart contracts and migrate them onto the blockchain:
```
truffle compile
truffle migrate
````

6. [Download and install](https://ipfs.io/docs/install/) the IPFS daemon. On Mac OS X and Linux:
```
tar xvfz go-ipfs.tar.gz
mv go-ipfs/ipfs /usr/local/bin/ipfs
````
or [Homebrew](https://brew.sh/) users:
```
brew install ipfs
````

7. Update your local IPFS config:
```
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'
````

8. Run the IPFS daemon:
```
ipfs daemon
```

9. In Metamask, configure RPC to be private network (localhost 8545) and import the first generated private key, which should be `44b899892eff7acc5a4abd4686f0c9cd56f9d60b2b5375bb5b4adaf850c9a167` if you used `Origin Demo` as your mnemonic in step 4. **DO NOT GET YOUR MAIN NET WALLET MIXED UP WITH DEVELOPMENT**.

10. Start Origin node application.
```
npm install
npm run start
````

11. A browser will open to http://localhost:3000
![Origin-homepage](https://user-images.githubusercontent.com/673455/30517963-0603f3d8-9b2d-11e7-9ef4-327b747695eb.png)

12. Try it! Create a listing and post it to IPFS and Ethereum.

## Get involved

We'd love to have you join us on this project.  We're still in the super early stages, but join our [slack channel](http://slack.originprotocol.com) or [email us](mailto:founders@originprotocol.com) to get started.
