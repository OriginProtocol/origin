var ListingsRegistryContract = require("../build/contracts/ListingsRegistry.json")
var contract = require("truffle-contract")

module.exports = function(deployer, network) {
  console.log("network", network)
  if (network === "development") {
    return deploy_sample_contracts()
  } else {
    // Don't create seed data on main net
  }
}

async function deploy_sample_contracts() {
  console.log("deploying listings")

  const default_account = web3.eth.accounts[0]

  const listingRegistryContract = contract(ListingsRegistryContract)
  listingRegistryContract.setProvider(web3.currentProvider)
  const listingRegistry = await listingRegistryContract.deployed()

  await listingRegistry.create(
    "0x4f32f7a7d40b4d65a917926cbfd8fd521483e7472bcc4d024179735622447dc9",
    web3.toWei(3, "ether"),
    1,
    { from: default_account, gas: 4476768 }
  )

  await listingRegistry.create(
    "0xa183d4eb3552e730c2dd3df91384426eb88879869b890ad12698320d8b88cb48",
    web3.toWei(0.6, "ether"),
    1,
    { from: default_account, gas: 4476768 }
  )
  await listingRegistry.create(
    "0xab92c0500ba26fa6f5244f8ba54746e15dd455a7c99a67f0e8f8868c8fab4a1a",
    web3.toWei(8.5, "ether"),
    1,
    { from: default_account, gas: 4476768 }
  )
  await listingRegistry.create(
    "0x6b14cac30356789cd0c39fec0acc2176c3573abdb799f3b17ccc6972ab4d39ba",
    web3.toWei(1.5, "ether"),
    1,
    { from: default_account, gas: 4476768 }
  )
  await listingRegistry.create(
    "0xff5957ff4035d28dcee79e65aa4124a4de4dcc8cb028faca54c883a5497d8917",
    web3.toWei(0.3, "ether"),
    25,
    { from: default_account, gas: 4476768 }
  )
}
