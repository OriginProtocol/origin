import OriginToken from '@origin/contracts/build/contracts/OriginToken'
import StandardToken from '@origin/contracts/build/contracts/TestToken'
import contracts from '../../contracts'
import txHelper, { checkMetaMask } from '../_txHelper'

async function deployToken(_, { type, name, decimals, supply, symbol, from }) {
  const web3 = contracts.web3Exec
  await checkMetaMask(from)
  const supplyWei = web3.utils.toWei(supply, 'ether')
  let tx, Contract

  if (type === 'Standard') {
    Contract = new web3.eth.Contract(StandardToken.abi)
    tx = Contract.deploy({
      data: StandardToken.bytecode,
      arguments: [name, symbol, decimals, supplyWei]
    })
  } else {
    Contract = new web3.eth.Contract(OriginToken.abi)
    tx = Contract.deploy({
      data: OriginToken.bytecode,
      arguments: [supplyWei]
    })
  }

  return txHelper({
    tx,
    from: from,
    gas: 4612388,
    mutation: 'deployToken',
    onReceipt: receipt => {
      let tokens = []
      try {
        tokens = JSON.parse(window.localStorage[`${context.net}Tokens`])
      } catch (e) {
        /* Ignore */
      }
      const tokenDef = {
        type: type,
        id: receipt.contractAddress,
        name: name,
        symbol: symbol,
        decimals: decimals,
        supplyWei
      }
      tokens.push(tokenDef)
      if (typeof window !== 'undefined') {
        window.localStorage[`${context.net}Tokens`] = JSON.stringify(tokens)
      }

      Contract.options.address = receipt.contractAddress
      contracts.tokens.push({
        ...tokenDef,
        contract: Contract,
        contractExec: Contract
      })
      contracts[receipt.contractAddress] = Contract

      if (type === 'OriginToken') {
        if (typeof window !== 'undefined') {
          window.localStorage[`${symbol}Contract`] =
            receipt.contractAddress
        }
        contracts.ogn = Contract
        contracts.ognExec = Contract
      }
    }
  })
}

export default deployToken

/*
mutation deployToken($name: String, $symbol: String, $decimals: Int, $supply: String) {
  deployToken(name: $name, symbol: $symbol, decimals: $decimals, supply: $supply)
}

{ "name": "OriginToken",
 "symbol": "OGN",
 "decimals": 2,
 "supply": "1000000"}

 */
