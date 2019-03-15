const VA_Marketplace = artifacts.require('./VA_Marketplace.sol')

// TODO: extract these addresses into a common file that can be imported from
// the various places that require these addresses
const marketplaceMultiSig = '0x8a1a4f77f9f0eb35fb9930696038be6220986c1b'

module.exports = function(deployer, network) {
  return deployer.then(() => {
    if (network === 'mainnet' || process.env['SIMULATE_MAINNET']) {
      return transferVAMarketplaceToMultiSig()
    }
  })
}

async function transferVAMarketplaceToMultiSig() {
  const accounts = await new Promise((resolve, reject) => {
    web3.eth.getAccounts((error, result) => {
      if (error) {
        reject(error)
      }
      resolve(result)
    })
  })
  const owner = accounts[0]

  // Transfer marketplace contract to multi-sig wallet.
  const marketplace = await VA_Marketplace.deployed()
  await marketplace.transferOwnership(marketplaceMultiSig, { from: owner })
  console.log(`marketplace contract owner set to ${marketplaceMultiSig}`)
}

