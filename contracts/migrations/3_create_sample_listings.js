const V00_Marketplace = artifacts.require('./V00_Marketplace.sol')
const V01_Marketplace = artifacts.require('./V01_Marketplace.sol')

module.exports = function(deployer, network) {
  return deployer.then(() => {
    if (network === 'mainnet') {
      console.log('Skipping sample listings on mainnet')
    } else {
      return deployContracts(deployer)
    }
  })
}

async function createListing(marketplace, hash, from) {
  await marketplace.createListing(hash, '0', from, { gas: 4612388, from })
}

async function deployContracts(deployer) {

  const accounts = await new Promise((resolve, reject) => {
    web3.eth.getAccounts((error, result) => {
      if (error) {
        reject(error)
      }
      resolve(result)
    })
  })

  const Seller = accounts[1]

  const marketplace00 = await V00_Marketplace.deployed()
  const marketplace01 = await V01_Marketplace.deployed()
  await createListing(
    marketplace00,
    '0xd3d6c53a86e51aa5c134642a138689c9d5e9c840320aa3c9f40974efed81ac85',
    Seller
  )
  await createListing(
    marketplace00,
    '0x3404c75a36ee9dddd04c551a7b5dba37b9686ef477d38efbd4026977bf45e665',
    Seller
  )
  await createListing(
    marketplace00,
    '0x663162b2ef97e7930fa57c846ea800514a05c336385213f48df1dc98f164f188',
    Seller
  )
  await createListing(
    marketplace01,
    '0x0c95bc42292714b6e2b017ad7fa379272fdfa15c40c0845beff40a1e5e590d3d',
    Seller
  )
  await createListing(
    marketplace01,
    '0xf3236837f5c7c940b2218cc36912784a36731a66608b2b0351e906ea175b2bea',
    Seller
  )
}
