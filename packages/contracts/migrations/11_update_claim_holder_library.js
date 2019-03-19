// This migration is needed to update our ClaimHolderLibrary. See: https://github.com/OriginProtocol/origin-js/pull/598
var ClaimHolderLibrary = artifacts.require("./ClaimHolderLibrary.sol")

module.exports = function(deployer, network) {
  return deployer.then(() => {
    return deployContracts(deployer)
  })
}

async function deployContracts(deployer) {
  await deployer.deploy(ClaimHolderLibrary)
}
