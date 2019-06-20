'use strict'

import MarketplaceContract from '@origin/contracts/build/contracts/V00_Marketplace'
import OriginTokenContract from '@origin/contracts/build/contracts/OriginToken'
import IdentityEventsContract from '@origin/contracts/build/contracts/IdentityEvents'
import ProxyFactoryContract from '@origin/contracts/build/contracts/ProxyFactory_solc'
import IdentityProxyContract from '@origin/contracts/build/contracts/IdentityProxy_solc'
import { exchangeAbi } from '@origin/graphql/src/contracts/UniswapExchange'

export function decodeTransaction(data) {
  const contractAbi = {
    MarketplaceContract: MarketplaceContract.abi,
    OriginTokenContract: OriginTokenContract.abi,
    IdentityEventsContract: IdentityEventsContract.abi,
    IdentityProxyContract: IdentityProxyContract.abi,
    ProxyFactoryContract: ProxyFactoryContract.abi,
    UniswapExchangeContract: exchangeAbi
  }

  let functionAbiMatch
  let contractName

  for (contractName in contractAbi) {
    const functions = contractAbi[contractName]
    functionAbiMatch = functions.find(functionAbi => {
      const sig = global.web3.eth.abi.encodeFunctionSignature(functionAbi)
      // First 4 bytes of data is the function signature
      return data.substr(0, 10) === sig
    })
    if (functionAbiMatch) {
      break
    }
  }

  if (!functionAbiMatch) {
    return false
  }

  return {
    functionName: functionAbiMatch.name,
    contractName: contractName,
    parameters: web3.eth.abi.decodeLog(
      functionAbiMatch.inputs,
      '0x' + data.substr(10)
    )
  }
}
