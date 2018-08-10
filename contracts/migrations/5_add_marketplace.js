const OriginToken = artifacts.require('./Token.sol')
const V00_Marketplace = artifacts.require('./V00_Marketplace.sol')
const V01_Marketplace = artifacts.require('./V01_Marketplace.sol')

module.exports = function(deployer) {
  return deployer.then(() => {
    return deployContracts(deployer)
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
  // const default_account = accounts[0]
  const Seller = accounts[1]

  await deployer.deploy(OriginToken, 'Origin', 'OGN', '18', '100000')
  await deployer.deploy(V00_Marketplace, OriginToken.address)
  await deployer.deploy(V01_Marketplace, OriginToken.address)

  // const token = await OriginToken.deployed()
  const marketplace1 = await V00_Marketplace.deployed()
  const marketplace2 = await V01_Marketplace.deployed()
  await createListing(marketplace1,
    '0x4f32f7a7d40b4d65a917926cbfd8fd521483e7472bcc4d024179735622447dc9', Seller
  )
  await createListing(marketplace1,
    '0xa183d4eb3552e730c2dd3df91384426eb88879869b890ad12698320d8b88cb48', Seller
  )
  await createListing(marketplace1,
    '0xab92c0500ba26fa6f5244f8ba54746e15dd455a7c99a67f0e8f8868c8fab4a1a', Seller
  )
  await createListing(marketplace2,
    '0x6b14cac30356789cd0c39fec0acc2176c3573abdb799f3b17ccc6972ab4d39ba', Seller
  )
  await createListing(marketplace2,
    '0xff5957ff4035d28dcee79e65aa4124a4de4dcc8cb028faca54c883a5497d8917', Seller
  )

  // console.log(marketplace)
  //
  // await token.transfer(Seller, 400).send({ from: default_account })
  // await token.approve(marketplace._address, 400).send({ from: Seller })
}
