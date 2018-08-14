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
    '0x036f2436e88d1a49fd41ed843bd531ee2ea234b247ad826c602c730aaf5dca7c', Seller
  )
  await createListing(marketplace1,
    "0x8c95c2b29113de838c6e68f552e5c31797c98d6eee55681fffeb26193a7577e6", Seller
  )
  await createListing(marketplace1,
    "0xeef630a340410c4ca88cfeeb105fcb1e7720d44f9c1b0e9c8e0998ccfecffcbb", Seller
  )
  await createListing(marketplace2,
    "0x67c16c669097b9b091af42979a58859ba160a5b8861dc8cb62345375deabbe11", Seller
  )
  await createListing(marketplace2,
    "0xbae479bb1f26346c313fda2fd91cc8a5dfe0286c3240fddf68b1b049cbb980ce", Seller
  )

  // console.log(marketplace)
  //
  // await token.transfer(Seller, 400).send({ from: default_account })
  // await token.approve(marketplace._address, 400).send({ from: Seller })
}
