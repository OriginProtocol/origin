var ListingsRegistry = artifacts.require("./ListingsRegistry.sol");
var Listing = artifacts.require("./Listing.sol");
var UserRegistry = artifacts.require("./UserRegistry.sol");
var PurchaseLibrary = artifacts.require("./PurchaseLibrary.sol");
var OriginIdentity = artifacts.require("./OriginIdentity.sol");

module.exports = function(deployer, network) {
  return deployer.then(() => {
    return deployContracts(deployer)
  })
}

async function deployContracts(deployer) {
  await deployer.deploy(PurchaseLibrary);
  await deployer.link(PurchaseLibrary, ListingsRegistry)
  await deployer.link(PurchaseLibrary, Listing)
  await deployer.deploy(ListingsRegistry);
  await deployer.deploy(UserRegistry);
  await deployer.deploy(OriginIdentity);
}
