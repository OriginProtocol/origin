var ClaimHolder = artifacts.require("./ClaimHolder.sol")
var ClaimHolderLibrary = artifacts.require("./ClaimHolderLibrary.sol")
var ClaimHolderPresigned = artifacts.require("./ClaimHolderPresigned.sol")
var ClaimHolderRegistered = artifacts.require("./ClaimHolderRegistered.sol")
var KeyHolder = artifacts.require("./KeyHolder.sol")
var KeyHolderLibrary = artifacts.require("./KeyHolderLibrary.sol")
var ListingsRegistry = artifacts.require("./ListingsRegistry.sol")
var ListingsRegistryStorage = artifacts.require("./ListingsRegistryStorage.sol")
var UnitListing = artifacts.require("./UnitListing.sol")
var UserRegistry = artifacts.require("./UserRegistry.sol")
var UnitPurchaseLibrary = artifacts.require("./UnitPurchaseLibrary.sol")
var OriginIdentity = artifacts.require("./OriginIdentity.sol")

module.exports = function(deployer, network) {
  return deployer.then(() => {
    return deployContracts(deployer)
  })
}

async function deployContracts(deployer) {
  await deployer.deploy(UnitPurchaseLibrary)
  await deployer.link(UnitPurchaseLibrary, ListingsRegistry)
  await deployer.link(UnitPurchaseLibrary, UnitListing)
  const listingsRegistryStorage = await deployer.deploy(ListingsRegistryStorage)
  const listingRegistry = await deployer.deploy(ListingsRegistry, listingsRegistryStorage.address)
  listingsRegistryStorage.setActiveRegistry(listingRegistry.address)

  await deployer.deploy(UserRegistry)

  await deployer.deploy(KeyHolderLibrary)
  await deployer.link(KeyHolderLibrary, KeyHolder)
  await deployer.link(KeyHolderLibrary, ClaimHolderLibrary)
  await deployer.deploy(ClaimHolderLibrary)

  await deployer.link(ClaimHolderLibrary, ClaimHolder)
  await deployer.link(KeyHolderLibrary, ClaimHolder)

  await deployer.link(ClaimHolderLibrary, ClaimHolderRegistered)
  await deployer.link(KeyHolderLibrary, ClaimHolderRegistered)

  await deployer.link(ClaimHolderLibrary, ClaimHolderPresigned)
  await deployer.link(KeyHolderLibrary, ClaimHolderPresigned)

  await deployer.link(ClaimHolderLibrary, OriginIdentity)
  await deployer.link(KeyHolderLibrary, OriginIdentity)
  await deployer.deploy(OriginIdentity)
}
