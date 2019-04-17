const IdentityEvents = artifacts.require('./IdentityEvents.sol')

module.exports = function(deployer, network) {
  return deployer.then(() => {
    return deployContracts(deployer)
  })
}

async function deployContracts(deployer) {
  await deployer.deploy(IdentityEvents)
}
