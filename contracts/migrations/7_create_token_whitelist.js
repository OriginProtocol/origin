const OriginToken = artifacts.require('./token/OriginToken.sol')
const V00_Marketplace = artifacts.require('./V00_Marketplace.sol')

// Store whitelist expiration as a UNIX timestamp.
const whitelistExpiration = Date.parse('28 Feb 2019 00:00:00 PST') / 1000

module.exports = function(deployer, network) {
  return deployer.then(() => {
    switch(network) {
      case "rinkeby":
      case "ropsten":
        return createTokenWhitelistForTestnets(network)

      case "mainnet":
        console.error('\n\n*** WHITELIST MIGRATION NOT YET IMPLEMENTED FOR MAINNET ***\n\n')
        return

      default:
        console.log(`Skipping whitelist creation for network ${network}`)
    }
  })
}

async function createTokenWhitelistForTestnets() {
  const token = await OriginToken.deployed()
  const tokenOwner = await token.owner()

  // The token contract owner is also the owner of the test faucet, which needs
  // to send tokens to arbitrary addresses.
  await token.addAllowedTransactor(tokenOwner, { from: tokenOwner })
  console.log(`Added token contract owner ${tokenOwner} to whitelist`)

  // Marketplace must be able to send OGN to any address (for refunds) and
  // receive OGN from any address (for offers with commissions).
  const marketplace = await V00_Marketplace.deployed()
  await token.addAllowedTransactor(marketplace.address, { from: tokenOwner })
  console.log(`Added marketplace ${marketplace.address} to whitelist`)

  // Activate the whitelist.
  await token.setWhitelistExpiration(whitelistExpiration, { from: tokenOwner })
  console.log(`Enabled token whitelist, expiring at UNIX timestamp ${whitelistExpiration}`)
}
