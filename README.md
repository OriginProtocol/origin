# 0rigin
The sharing economy without intermediaries.

## Overview

0rigin is a sharing economy marketplace that enables buyers and sellers of fractional use goods and services (car-sharing, service-based tasks, home-sharing, etc.) to transact on the distributed, open web. Using the Ethereum blockchain and Interplanetary File System (IPFS), the platform and community are decentralized, allowing for the creation and booking of services and goods without traditional intermediaries.

We are specifically building a large-scale commerce network that:
* Transfers direct financial value (listing, transaction, and service fees) from large corporations like Airbnb, Craigslist, Postmates, etc. to individual buyers and sellers
* Transfers indirect financial and strategic value (privately aggregated silos of customer and transaction data) from those same corporations to the entire ecosystem
* Creates new financial value for marketplace participants that contribute to the growth of the network (e.g. building new technology for the 0rigin network, bootstrapping new product verticals, and referring new users and businesses)
* Is built on an open, distributed, and shared data layer to promote transparency and collaboration
* Immediately allows buyers and sellers across the world to do business with each other without difficult currency conversions or tariffs
* Promotes personal liberty by not allowing a central corporation or government to impose arbitrary and oftentimes onerous rules on how to do business

To accomplish these ambitious goals, the 0rigin platform is being launched with incentives from the outset to encourage other technologists, businesses, and consumers to build, contribute, and extend the ecosystem with us. We imagine a broad collection of vertical use cases (e.g short-term vacation rentals, freelance software engineering, tutoring for hire) that are built on top of 0rigin standards and shared data. Together, we will create the Internet economy of tomorrow.

To learn more about this project, please visit [the 0rigin website](http://www.0rigin.org) and download our whitepaper.

## In this repo

This repo will be the home for all the various components of the 0rigin platform.  Including:

* Common base schemas that will be used frequently & can be inherited (email addresses, international addresses, phone numbers, etc.) 
* Vertical-specific schemas like home-sharing, car-sharing, services, etc.
* An 0rigin dApp for publishing new listings, or searching or booking existing listings
* Our Ethereum smart contracts
* Backend service that fetches listings and makes them searchable
* The 0rigin.org landing page
* Other tools like validators, notification apps, etc.

## Getting up to speed

If you're new to the space, it may be helpful to first familiarize yourself with some of the core technologies that we're using to build 0rigin. 

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
3. Clone 0rigin:
```
git clone https://github.com/0riginOrg/0rigin
cd 0rigin
```
4. Compile contracts:
```
truffle compile
truffle migrate
````
5. Start testrpc:
```
testrpc
```
  This will output credentials for several test wallets with 100 ETH. You'll need to use one of the private keys in a later step.

6. In a new terminal tab, start the 0rigin node application. 
```
npm install
npm run start
````
6. A browser will open to http://localhost:3000
![0rigin-homepage](https://user-images.githubusercontent.com/673455/30517963-0603f3d8-9b2d-11e7-9ef4-327b747695eb.png)
  
7. In Metamask, configure RPC to be private network (localhost 8545) and import the private key for one of your test wallets from previous step. **DO NOT GET YOUR MAIN NET WALLET MIXED UP**.
  * This needs to be done every single time a new testrpc instance is run.
  * After awhile, your Metamask will be cluttered with invalid addresses. [Here is how you clear it](https://ethereum.stackexchange.com/questions/21422/how-to-remove-unused-test-accounts-from-metamask/21468)
  * While we dev, I would actually not recommend having real Eth in a Main Net wallet so we can dump it whenever

8. Try it! Create a listing and post it to IPFS and Ethereum.

## Get involved

We'd love to have you join us on this project.  We're still in the super early stages, but join our [slack channel](http://slack.0rigin.org) or [email us](mailto:founders@0rigin.org) to get started.
