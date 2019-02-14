const OriginToken = artifacts.require('./token/OriginToken.sol')
const VA_Marketplace = artifacts.require('./VA_Marketplace.sol')

module.exports = function(deployer, network) {
  return createTokenWhitelist(network)
}

async function createTokenWhitelist(network) {
  const token = await OriginToken.deployed()
  const tokenOwner = await token.owner()


  // Marketplace must be able to send OGN to any address (for refunds) and
  // receive OGN from any address (for offers with commissions).
  const marketplace = await VA_Marketplace.deployed()
  await token.addAllowedTransactor(marketplace.address, { from: tokenOwner })
  console.log(`Added marketplace ${marketplace.address} to whitelist`)
}
