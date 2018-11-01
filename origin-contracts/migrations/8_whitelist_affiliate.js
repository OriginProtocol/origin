const V00_Marketplace = artifacts.require('./V00_Marketplace.sol')

module.exports = function(deployer, network) {
  return deployer.then(() => {
    return whitelistAffiliate(deployer, network)
  })
}

async function whitelistAffiliate(_, network) {
  const accounts = await new Promise((resolve, reject) => {
    web3.eth.getAccounts((error, result) => {
      if (error) {
        reject(error)
      }
      resolve(result)
    })
  })

  const marketplace = await V00_Marketplace.deployed()
  const from = await marketplace.owner()

  // These need to remain synced with the dockerfiles in origin-box.
  const affiliates = {
    rinkeby: '0xc1a33cda27c68e47e370ff31cdad7d6522ea93d5',
    origin: '0xc1a33cda27c68e47e370ff31cdad7d6522ea93d5',
    development: '0x821aea9a577a9b44299b9c15c88cf3087f3b5544',
    mainnet: '0x7aD0fa0E2380a5e0208B25AC69216Bd7Ff206bF8'
  }

  if (process.env['SIMULATE_MAINNET']) {
    console.log('simulating mainnet')
    network = 'mainnet'
  }
  const affiliate = affiliates[network]
  if (affiliate) {
    console.log(`whitelisting affiliate ${affiliate}`)
    await marketplace.addAffiliate(
      affiliate,
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      { from }
    )
  } else {
    console.log(`WARNING: no affiliate whitelisted for network ${network}`)
  }
}
