import Marketplace from 'origin-contracts/build/contracts/V00_Marketplace'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts, { setMarketplace } from '../../contracts'

async function deployMarketplace(_, { token, version, from, autoWhitelist }) {
  const web3 = contracts.web3Exec
  await checkMetaMask(from)
  const Contract = new web3.eth.Contract(Marketplace.abi)
  const tx = Contract.deploy({
    data: Marketplace.bytecode,
    arguments: [token]
  }).send({
    gas: 5500000,
    from: from || web3.eth.defaultAccount
  })

  return txHelper({
    tx,
    mutation: 'deployMarketplace',
    onReceipt: receipt => {
      window.localStorage.marketplaceContract = receipt.contractAddress

      let marketplaces = {}
      try {
        marketplaces = JSON.parse(window.localStorage.marketplaces)
      } catch (e) {
        /* Ignore */
      }
      marketplaces[version] = receipt.contractAddress
      localStorage.marketplaces = JSON.stringify(marketplaces)

      setMarketplace(receipt.contractAddress, receipt.blockNumber)

      const Token = contracts[token]
      if (!autoWhitelist || !Token) {
        return
      }

      if (Token) {
        Token.methods
          .addCallSpenderWhitelist(receipt.contractAddress)
          .send({
            gas: 4000000,
            from: from
          })
          .then(() => {})
          .catch()
      }
    }
  })
}

export default deployMarketplace

/*
mutation deployMarketplace($token: String) {
  deployMarketplace(token: $token)
}
{ "token": "0x7c38A2934323aAa8dAda876Cfc147C8af40F8D0e"}
*/
