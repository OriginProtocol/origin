const OriginToken = artifacts.require('./token/OriginToken.sol')
const V00_Marketplace = artifacts.require('./V00_Marketplace.sol')

const tokenMultiSig = '0xe011fa2a6df98c69383457d87a056ed0103aa352'
const marketplaceMultiSig = '0x8a1a4f77f9f0eb35fb9930696038be6220986c1b'

module.exports = function(deployer, network) {
  return deployer.then(() => {
    if (network === 'mainnet' || process.env['SIMULATE_MAINNET']) {
      return verifyMainnetContracts()
    }
  })
}

async function verifyMainnetContracts() {
  await verifyTokenContract()
  await verifyMarketplaceContract()
}

async function verifyTokenContract() {
  const accounts = await new Promise((resolve, reject) => {
    web3.eth.getAccounts((error, result) => {
      if (error) {
        reject(error)
      }
      resolve(result)
    })
  })
  const oldOwner = accounts[0]
  const token = await OriginToken.deployed()
  const marketplace = await V00_Marketplace.deployed()

  console.log('Validating token contract')

  assertEquals(await token.name(), 'OriginToken', 'name')
  assertEquals(await token.decimals(), 18, 'decimals')
  assertEquals(await token.symbol(), 'OGN', 'symbol')
  assertEquals(
    (await token.owner()).toLowerCase(),
    tokenMultiSig.toLowerCase(),
    'owner'
  )
  assertEquals(await token.paused(), false, 'not paused')
  assertEquals(
    await token.callSpenderWhitelist(marketplace.address),
    true,
    'marketplace whitelisted for approveAndCallWithSender'
  )
  assertEquals(
    await token.allowedTransactors(oldOwner),
    false,
    'old owner not allowed to transfer tokens'
  )
  assertEquals(
    await token.allowedTransactors(marketplace.address),
    true,
    'marketplace allowed to transfer tokens'
  )
  assertEquals(
    await token.allowedTransactors(tokenMultiSig),
    true,
    'multi-sig allowed to transfer tokens'
  )
  assertEquals(
    await token.allowedTransactors('0x7aD0fa0E2380a5e0208B25AC69216Bd7Ff206bF8'),
    true,
    'other wallet allowed to transfer tokens'
  )
  assertEquals(
    await token.whitelistExpiration(),
    Date.parse('28 Feb 2019 00:00:00 PST') / 1000,
    'whitelist expires on 2/28/2019'
  )
}

async function verifyMarketplaceContract() {
  const token = await OriginToken.deployed()
  const marketplace = await V00_Marketplace.deployed()

  console.log('Validating marketplace contract')

  assertEquals(
    await marketplace.tokenAddr(),
    token.address,
    'marketplace tokenAddr points to OriginToken'
  )
  assertEquals(
    await marketplace.owner(),
    marketplaceMultiSig,
    'marketplace contract owned by multi-sig'
  )
  assertEquals(
    await marketplace.allowedAffiliates(marketplace.address),
    false,
    'marketplace affiliate whitelist enabled'
  )
  assertEquals(
    await marketplace.allowedAffiliates('0x7aD0fa0E2380a5e0208B25AC69216Bd7Ff206bF8'),
    true,
    'marketplace affiliate address is whitelisted'
  )
}

function assertEquals(got, expected, message) {
  if (got != expected) {
    throw new Error(`${message}: contract value ${got} != expected ${expected}`)
  }
  console.log(`  * ${message}: pass`)
}
