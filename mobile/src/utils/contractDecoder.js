'use strict'

import Web3 from 'web3'

import MarketplaceContract from '@origin/contracts/build/contracts/V00_Marketplace'
import IdentityEventsContract from '@origin/contracts/build/contracts/IdentityEvents'

const web3 = new Web3()

export function decodeTransaction(data) {
  const functionSignature = data.substr(0, 10)
  const marketplaceContract = new web3.eth.Contract(MarketplaceContract.abi)
  const identityEventsContract = new web3.eth.Contract(IdentityEventsContract.abi)

  const interfaces = [
    ...marketplaceContract._jsonInterface,
    ...identityEventsContract._jsonInterface
  ]

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
    name: functionInterface.name,
    parameters: web3.eth.abi.decodeLog(
      functionInterface.inputs,
      '0x' + data.substr(10)
    )
  }
}
