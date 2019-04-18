import { default as IntEventCache } from './EventCache' // what the hell

export { default as EventCache } from './EventCache' //      is this babel?

/**
 * This function will patch a web3.eth.Contract with the eventCache method
 *
 * @param contract {web3.eth.Contract} The contract to patch
 * @param fromBlock {number} The block number to start the event search at
 * @param config {object} A configuration JS object (See EventCache)
 */
export function patchWeb3Contract(contract, fromBlock = 0, config) {
  if (contract.hasOwnProperty('eventCache')) {
    throw new TypeError(`Contract already has eventCache property!`)
  }
  contract.eventCache = new IntEventCache(contract, fromBlock, config)
  return contract
}
