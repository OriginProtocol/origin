var OriginIdentity = artifacts.require("./OriginIdentity.sol");
var Web3 = require("web3")

const issuer_1 = "0x99C03fBb0C995ff1160133A8bd210D0E77bCD101"
const issuer_2 = "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf"
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

  await originIdentity.addKey(
    Web3.utils.soliditySha3(issuer_1),
    keyPurpose,
    keyType,
    { from: defaultAccount, gas: 4000000 }
  )

  return await originIdentity.addKey(
    Web3.utils.soliditySha3(issuer_2),
    keyPurpose,
    keyType,
    { from: defaultAccount, gas: 4000000 }
  )
}
