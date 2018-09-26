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

  const affiliates = {
    rinkeby: accounts[0],
    ropsten: accounts[0],
    origin: accounts[0],
    development: accounts[0]
    // TODO: add affiliate address for mainnet
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
