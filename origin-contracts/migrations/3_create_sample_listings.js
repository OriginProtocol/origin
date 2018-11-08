const V00_Marketplace = artifacts.require('./V00_Marketplace.sol')

module.exports = function(deployer, network) {
  return deployer.then(() => {
    if (network === 'mainnet' || network === 'rinkeby' || network === 'ropsten') {
      console.log(`Skipping sample listings creation on ${network}`)
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

  await createListing(
    marketplace00,
    '0x551e4fd07429fd2d072ca0d6668ff1c45a03a24f03191986be9b4c30a242c2ed',
    Seller
  )
  await createListing(
    marketplace00,
    '0xb1ddde9f48791e6519b6b19e4318398df8e432a4dd68e694a6e52c87810cb6cb',
    Seller
  )
  await createListing(
    marketplace00,
    '0xe83be3434158c69d42c1269260d3c44eeb37c316017d3e22352dea86e6b5afaf',
    Seller
  )
  await createListing(
    marketplace00,
    '0x0f70fe3695f72660752fde3eb6d6aa02290758bc7cf6111f4e1e6bcb53c42633',
    Seller
  )
  await createListing(
    marketplace00,
    '0x4cf7707c33291cb383d5001d7fc9d7ec9963658b2a55be1ba81db05381f293e7',
    Seller
  )
}
