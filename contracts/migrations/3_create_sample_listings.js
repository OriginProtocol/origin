var ListingsRegistryContract = require("../build/contracts/ListingsRegistry.json")
var contract = require("truffle-contract")

module.exports = function(deployer, network) {
  console.log('network', network)
  if (network === 'development') {
    console.log('deploying listings')
    let deployed
    let listingRegistryContract = contract(ListingsRegistryContract)
    listingRegistryContract.setProvider(web3.currentProvider)
    listingRegistryContract.deployed()
    .then((deployedContract) => {
      deployed = deployedContract
      return deployed.create(
        "0x4f32f7a7d40b4d65a917926cbfd8fd521483e7472bcc4d024179735622447dc9",
        3.999,
        1,
        { from: web3.eth.accounts[0], gas: 4476768 }
      )
    })
    .then(() => {
      return deployed.create(
        "0xa183d4eb3552e730c2dd3df91384426eb88879869b890ad12698320d8b88cb48",
        0.600,
        1,
        { from: web3.eth.accounts[0], gas: 4476768 }
      )
    })
    .then(() => {
      return deployed.create(
        "0xab92c0500ba26fa6f5244f8ba54746e15dd455a7c99a67f0e8f8868c8fab4a1a",
        8.500,
        1,
        { from: web3.eth.accounts[0], gas: 4476768 }
      )
    })
    .then(() => {
      return deployed.create(
        "0x6b14cac30356789cd0c39fec0acc2176c3573abdb799f3b17ccc6972ab4d39ba",
        1.500,
        1,
        { from: web3.eth.accounts[0], gas: 4476768 }
      )
    })
    .then(() => {
      return deployed.create(
        "0xff5957ff4035d28dcee79e65aa4124a4de4dcc8cb028faca54c883a5497d8917",
        0.300,
        25,
        { from: web3.eth.accounts[0], gas: 4476768 }
      )
    })
  } else {
    // Don't create seed data on main net
  }
}
