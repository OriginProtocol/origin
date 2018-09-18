const OriginToken = artifacts.require('./token/OriginToken.sol')
const V00_Marketplace = artifacts.require('./V00_Marketplace.sol')

module.exports = function(deployer) {
  return deployer.then(() => {
    return deployContracts(deployer)
  })
}

async function deployContracts(deployer) {

  // Initial supply of 1B tokens, in natural units.
  await deployer.deploy(OriginToken, '1000000000000000000000000000')

  await deployer.deploy(V00_Marketplace, OriginToken.address)

  //register the marketplace as a possible caller upon token approval
  const token = await OriginToken.deployed()
  const contractOwner = await token.owner()
  await token.addCallSpenderWhitelist(V00_Marketplace.address, {from:contractOwner})
}
