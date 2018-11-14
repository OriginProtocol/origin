const OriginToken = artifacts.require('./token/OriginToken.sol')
const V00_Marketplace = artifacts.require('./V00_Marketplace.sol')

// TODO: extract these addresses into a common file that can be imported from
// the various places that require these addresses
const tokenMultiSig = '0xe011fa2a6df98c69383457d87a056ed0103aa352'
const marketplaceMultiSig = '0x8a1a4f77f9f0eb35fb9930696038be6220986c1b'

module.exports = function(deployer, network) {
  return deployer.then(() => {
    if (network === 'mainnet' || process.env['SIMULATE_MAINNET']) {
      return transferTokensAndContractsToMultiSig()
    }
  })
}

async function transferTokensAndContractsToMultiSig() {
  const accounts = await new Promise((resolve, reject) => {
    web3.eth.getAccounts((error, result) => {
      if (error) {
        reject(error)
      }
      resolve(result)
    })
  })
  const owner = accounts[0]
  const token = await OriginToken.deployed()

  // Transfer all tokens to multi-sig wallet.
  const balance = await token.balanceOf(owner)
  const decimals = await token.decimals()
  await token.transfer(tokenMultiSig, balance, { from: owner })
  const balanceTokens = balance / 10**decimals
  console.log(`transferred ${balanceTokens} OGN to ${tokenMultiSig}`)

  // Contract owner is a throwaway account, so remove it from the transactor
  // whitelist.
  await token.removeAllowedTransactor(owner, { from: owner })

  // Transfer token contract to multi-sig wallet.
  await token.transferOwnership(tokenMultiSig, { from: owner })
  console.log(`token contract owner set to ${tokenMultiSig}`)

  // Transfer marketplace contract to multi-sig wallet.
  const marketplace = await V00_Marketplace.deployed()
  await marketplace.transferOwnership(marketplaceMultiSig, { from: owner })
  console.log(`marketplace contract owner set to ${marketplaceMultiSig}`)
}

