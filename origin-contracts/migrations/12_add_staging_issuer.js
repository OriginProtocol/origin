// Migration to add an attestation key specific to staging on Rinkeby
// (vs using same signing key as prod which was the behavior prior to this change).
var OriginIdentity = artifacts.require('./OriginIdentity.sol');
var Web3 = require('web3')

const ISSUER_STAGING = '0x5be37555816d258f5e316e0f84D59335DB2400B2'
const keyPurpose = 3
const keyType = 1

module.exports = function(deployer, network) {
  return deployer.then(() => {
    return add_sample_issuer(network)
  })
}

async function add_sample_issuer(network) {
  let accounts = await new Promise((resolve, reject) => {
    web3.eth.getAccounts((error, result) => {
      if (error) {
        reject(err)
      }
      resolve(result)
    })
  })

  let defaultAccount = accounts[0]
  let originIdentity = await OriginIdentity.deployed()

  if (network === 'rinkeby') {
    await originIdentity.addKey(
      Web3.utils.soliditySha3(ISSUER_STAGING),
      keyPurpose,
      keyType,
      { from: defaultAccount, gas: 4000000 }
    )
  }
}
