const OriginToken = artifacts.require('./token/OriginToken.sol')
const VA_Marketplace = artifacts.require('./VA_Marketplace.sol')

module.exports = function(deployer, network) {
  return deployer.then(() => {
    return deployContracts(deployer, network)
  })
}

async function deployContracts(deployer, network) {
  const token = await OriginToken.deployed()
  const netId = OriginToken.network_id

  await deployer.deploy(VA_Marketplace, token.address, netId)
  const contractOwner = await token.owner()
  if (!(network === 'mainnet' || process.env['SIMULATE_MAINNET'])) {
    await token.addCallSpenderWhitelist(VA_Marketplace.address, {
      from: contractOwner
    })
  }
}
