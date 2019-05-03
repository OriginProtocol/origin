'use strict'

import Web3 from 'web3'

import MarketplaceContract from '@origin/contracts/build/contracts/V00_Marketplace'
import OriginTokenContract from '@origin/contracts/build/contracts/OriginToken'
import IdentityEventsContract from '@origin/contracts/build/contracts/IdentityEvents'
import { exchangeAbi } from '@origin/graphql/src/contracts/UniswapExchange'

const web3 = new Web3()

export function decodeTransaction(data) {
  const possibleFunctions = [
    ...MarketplaceContract.abi,
    ...OriginTokenContract.abi,
    ...IdentityEventsContract.abi,
    ...exchangeAbi
  ]

  const functionAbiMatch = possibleFunctions.find(functionAbi => {
    const sig = web3.eth.abi.encodeFunctionSignature(functionAbi)
    // First 4 bytes of data is the function signature
    return data.substr(0, 10) === sig
  })

  if (!functionAbiMatch) {
    return false
  }

  return {
    functionName: functionAbiMatch.name,
    parameters: web3.eth.abi.decodeLog(
      functionAbiMatch.inputs,
      '0x' + data.substr(10)
    )
  }
}
