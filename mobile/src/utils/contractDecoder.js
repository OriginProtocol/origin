'use strict'

import { ethers } from 'ethers'

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
  let contractInterface

  for (contractName in contractAbi) {
    contractInterface = new ethers.utils.Interface(contractAbi[contractName])
    functionAbiMatch = Object.values(contractInterface.functions).find(
      functionAbi => {
        return data.substr(0, 10) === functionAbi.sighash
      }
    )
    if (functionAbiMatch) {
      break
    }
  }

  if (!functionAbiMatch) {
    console.debug('No matching function signature in Origin contracts')
    return false
  }

  const parameterNames = functionAbiMatch.inputs.map(i => i.name)
  const parsedTransaction = contractInterface.parseTransaction({ data })

  // Build an object of parameters with the key as the arg name
  const parameters = {}
  parameterNames.forEach(
    (key, i) => (parameters[key] = parsedTransaction.args[i])
  )

  return {
    functionName: functionAbiMatch.name,
    contractName: contractName,
    parameters: parameters
  }
}
