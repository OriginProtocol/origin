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

  const Seller = accounts[1]

  const marketplace1 = await V00_Marketplace.deployed()
  const marketplace2 = await V01_Marketplace.deployed()
  await createListing(marketplace1,
    '0x70c3479b0249dd1f868da071acfdf8abb4ef2342a71f49a796ff780866457a13', Seller
  )
  await createListing(marketplace1,
    '0x509b9a40dd2059647486985751b394d1a51be9be861d054e51b32b6d35c8bd5c', Seller
  )
  await createListing(marketplace1,
    '0xf9013246c5635f1716b3287b7c87c724ac319510725525597fb8db1d3fc682fa', Seller
  )
  await createListing(marketplace2,
    '0x7e8bfc4fb480d0da8afcbeba6e4b695f2734707524bb94a1e6bf57788f66c536', Seller
  )
  await createListing(marketplace2,
    '0xf8e9278942da49f74dd61b2c3792f63fe27deda2c770f82ecf20f434cd9edc76', Seller
  )
}
