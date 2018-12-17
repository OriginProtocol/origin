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
    '0xf52f1addaf595a2a4be4f1e4d58901b93b06f07f8a4fb9d04af3d022be23a21b',
    Seller
  )
  await createListing(
    marketplace00,
    '0x4775a5d673a7461efe0a06fd31885b50ab87ba3f9c47bab9a7c16ddecbaacd59',
    Seller
  )
  await createListing(
    marketplace00,
    '0xff47388f08b658fb4b0501a6dc82e00ab03b91503390c9aa6d7bead00b8ede7b',
    Seller
  )
  await createListing(
    marketplace00,
    '0x8bb6183b80bffe3565966cac40d82b30bfa66e0fed2cdaf20466689044512828',
    Seller
  )
  await createListing(
    marketplace00,
    '0x26b2acee72df5ce75b915cdef3a1a777331e97a5f50871cde1a0c51c2609f6d2',
    Seller
  )
}
