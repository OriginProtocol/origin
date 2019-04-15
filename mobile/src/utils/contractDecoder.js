'use strict'

import Web3 from 'web3'

import graphqlContext from '@origin/graphql/src/contracts'

const web3 = new Web3()

export function decodeTransaction(data) {
  const functionSignature = data.substr(0, 10)

  const interfaces = [
    ...graphqlContext.marketplace._jsonInterface,
    ...graphqlContext.identityEvents._jsonInterface
  ]

  if (graphqlContext.daiExchange) {
    interfaces.push(...graphqlContext.daiExchange._jsonInterface)
  }

  let functionInterface
  for (const iface of interfaces) {
    if (iface.signature === functionSignature) {
      functionInterface = iface
    }
  }

  if (!functionInterface) {
    return false
  }

  return {
    functionName: functionInterface.name,
    parameters: web3.eth.abi.decodeLog(
      functionInterface.inputs,
      '0x' + data.substr(10)
    )
  }
}
