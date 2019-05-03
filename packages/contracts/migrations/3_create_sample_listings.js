const bs58 = require('bs58');
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

function getBytes32FromIpfsHash(ipfsListing) {
  return (
      "0x" +
      bs58
        .decode(ipfsListing)
        .slice(2)
        .toString("hex")
  )
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

  // hawaii-house
  await createListing(
    marketplace00,
    getBytes32FromIpfsHash('QmQt4GJ7RJjp8WasLRzTRKFdkmzcfzkmZqNG588Qv6Cnht'),
    Seller
  )
  // lake-house
  await createListing(
    marketplace00,
    getBytes32FromIpfsHash('QmYuyE3q76hxgMjdNJXZ5YuXMNaiWGSy2RmKfwprSvd64j'),
    Seller
  )
  // scout
  await createListing(
    marketplace00,
    getBytes32FromIpfsHash('QmWybYPvhjeCfvUf1eTWibayoJwuBnTMpV771syXCc7iZe'),
    Seller
  )
  // taylor-swift-tix
  await createListing(
    marketplace00,
    getBytes32FromIpfsHash('QmNyo8RCuhqDCgyQkVuihjTB1KJ3EXxkiTHmkzukFiw9Nd'),
    Seller
  )
  // zinc-house
  await createListing(
    marketplace00,
    getBytes32FromIpfsHash('Qmc3aEWjznMNEReZuxLH6aZhdRjB5d25qbT7GCdje7CPvH'),
    Seller
  )
  // origin-spaceman
  await createListing(
    marketplace00,
    getBytes32FromIpfsHash('QmRu1wze7iGY2TJD8jxtN7QFUyALbkiDidgfopvEfwFTSP'),
    Seller
  )
}
