const OriginToken = artifacts.require('./token/OriginToken.sol')
const V00_Marketplace = artifacts.require('./V00_Marketplace.sol')

// Store whitelist expiration as a UNIX timestamp.
const whitelistExpiration = Date.parse('28 Feb 2019 00:00:00 PST') / 1000

module.exports = function(deployer, network) {
  if (network !== 'development' || process.env['SIMULATE_MAINNET']) {
    return createTokenWhitelist(network)
  }
}

async function createTokenWhitelist(network) {
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

  if (network === 'mainnet' || process.env['SIMULATE_MAINNET']) {
    const addresses = [
      '0x7aD0fa0E2380a5e0208B25AC69216Bd7Ff206bF8', // affiliate
      '0xe011fa2a6df98c69383457d87a056ed0103aa352' // ERC20 multi-sig
    ]
    for (const address of addresses) {
      await token.addAllowedTransactor(address, { from: tokenOwner })
      console.log(`Added address ${address} to whitelist`)
    }
  }

  // Activate the whitelist.
  await token.setWhitelistExpiration(whitelistExpiration, { from: tokenOwner })
  console.log(
    `Enabled token whitelist, expiring at UNIX timestamp ${whitelistExpiration}`
  )
}
