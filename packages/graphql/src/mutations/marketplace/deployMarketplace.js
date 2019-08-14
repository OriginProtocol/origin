import MarketplaceV0 from '@origin/contracts/build/contracts/V00_Marketplace'
import MarketplaceV1 from '@origin/contracts/build/contracts/V01_Marketplace'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts, { setMarketplace } from '../../contracts'

async function deployMarketplace(_, { token, from, autoWhitelist, version }) {
  const Marketplace = version === '001' ? MarketplaceV1 : MarketplaceV0
  const data = Marketplace.bytecode
  const web3 = contracts.web3Exec
  await checkMetaMask(from)
  const Contract = new web3.eth.Contract(Marketplace.abi)

  return txHelper({
    tx: Contract.deploy({ data, arguments: [token] }),
    gas: 5500000,
    from,
    mutation: 'deployMarketplace',
    onReceipt: receipt => {
      setMarketplace(receipt.contractAddress, receipt.blockNumber, version)

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
