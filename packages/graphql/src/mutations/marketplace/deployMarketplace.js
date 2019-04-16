import Marketplace from '@origin/contracts/build/contracts/V00_Marketplace'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts, { setMarketplace } from '../../contracts'
const data = Marketplace.bytecode

async function deployMarketplace(_, { token, from, autoWhitelist }) {
  const web3 = contracts.web3Exec
  await checkMetaMask(from)
  const Contract = new web3.eth.Contract(Marketplace.abi)
  const tx = Contract.deploy({ data, arguments: [token] }).send({
    gas: 5500000,
    from
  })

  return txHelper({
    tx,
    from,
    mutation: 'deployMarketplace',
    onReceipt: receipt => {
      // console.log('Deployed marketplace to', receipt.contractAddress)
      if (typeof window !== 'undefined') {
        window.localStorage.marketplaceContract = receipt.contractAddress
      }

      setMarketplace(receipt.contractAddress, receipt.blockNumber)

      const Token = contracts[token]
      if (!autoWhitelist || !Token) {
        return
      }

      if (Token) {
        Token.methods
          .addCallSpenderWhitelist(receipt.contractAddress)
          .send({
            gas: 4612388,
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
