'use strict'

import MarketplaceContract from '@origin/contracts/build/contracts/V00_Marketplace'
import IdentityEventsContract from '@origin/contracts/build/contracts/IdentityEvents'

export function decodeTransaction(data) {
  const functionSignature = data.substr(0, 10)
  const marketplaceContract = new web3.eth.Contract(MarketplaceContract.abi)

  let functionInterface
  for (const iface of marketplaceContract._jsonInterface) {
    if (iface.signature === functionSignature) {
      functionInterface = iface
    }
  }

  if (!functionInterface) {
    return false
  }

  return {
    name: functionInterface.name,
    parameters: web3.eth.abi.decodeLog(functionInterface.inputs, '0x' + data.substr(10))
  }
}
