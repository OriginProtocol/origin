var OriginIdentity = artifacts.require("./OriginIdentity.sol");
var Web3 = require("web3")

const ISSUER_TEST = "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf"
const ISSUER_DEV = "0x99C03fBb0C995ff1160133A8bd210D0E77bCD101"
const ISSUER_PROD = "0x8EAbA82d8D1046E4F242D4501aeBB1a6d4b5C4Aa"
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

  if (network === "development") {
    await originIdentity.addKey(
      Web3.utils.soliditySha3(ISSUER_TEST),
      keyPurpose,
      keyType,
      { from: defaultAccount, gas: 4000000 }
    )

    return await originIdentity.addKey(
      Web3.utils.soliditySha3(ISSUER_DEV),
      keyPurpose,
      keyType,
      { from: defaultAccount, gas: 4000000 }
    )
  } else {
    return await originIdentity.addKey(
      Web3.utils.soliditySha3(ISSUER_PROD),
      keyPurpose,
      keyType,
      { from: defaultAccount, gas: 4000000 }
    )
  }
}
