const OriginToken = artifacts.require('./token/OriginToken.sol')
const V00_Marketplace = artifacts.require('./V00_Marketplace.sol')
const V01_Marketplace = artifacts.require('./V01_Marketplace.sol')

module.exports = function(deployer) {
  return deployer.then(() => {
    return deployContracts(deployer)
  })
}

async function deployContracts(deployer) {

  // Initial supply of 1B tokens, in natural units.
  await deployer.deploy(OriginToken, '1000000000000000000000000000')

  await deployer.deploy(V00_Marketplace, OriginToken.address)
  await deployer.deploy(V01_Marketplace, OriginToken.address)
}
