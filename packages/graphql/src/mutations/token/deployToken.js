import OriginToken from '@origin/contracts/build/contracts/OriginToken'
import StandardToken from '@origin/contracts/build/contracts/TestToken'
import contracts from '../../contracts'
import txHelper, { checkMetaMask } from '../_txHelper'

async function deployToken(_, args) {
  const web3 = contracts.web3Exec
  await checkMetaMask(web3.eth.defaultAccount)
  const supply = web3.utils.toWei(args.supply, 'ether')
  let tx, Contract

  if (args.type === 'Standard') {
    Contract = new web3.eth.Contract(StandardToken.abi)
    tx = Contract.deploy({
      data: StandardToken.bytecode,
      arguments: [args.name, args.symbol, args.decimals, supply]
    })
  } else {
    Contract = new web3.eth.Contract(OriginToken.abi)
    tx = Contract.deploy({
      data: OriginToken.bytecode,
      arguments: [supply]
    })
  }

  tx = tx.send({ gas: 4612388, from: args.from })

  return txHelper({
    tx,
    from: args.from,
    mutation: 'deployToken',
    onReceipt: receipt => {
      let tokens = []
      try {
        tokens = JSON.parse(window.localStorage[`${context.net}Tokens`])
      } catch (e) {
        /* Ignore */
      }
      const tokenDef = {
        type: args.type,
        id: receipt.contractAddress,
        name: args.name,
        symbol: args.symbol,
        decimals: args.decimals,
        supply
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

      if (args.type === 'OriginToken') {
        if (typeof window !== 'undefined') {
          window.localStorage[`${args.symbol}Contract`] =
            receipt.contractAddress
        }
        contracts.ogn = Contract
        contracts.ognExec = Contract
        contracts[receipt.contractAddress] = contracts.ogn
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
