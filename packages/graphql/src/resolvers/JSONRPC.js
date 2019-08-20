import contracts from '../contracts'
import { cached } from '../utils/cached'

const BLOCK_DURATION = 15000

/**
 * contracts.web3 is not availble at compile time, so we will define the
 * functions at first call
 */
let getBlockNumber, version

export default {
  eth_blockNumber: () => {
    if (!getBlockNumber)
      getBlockNumber = cached(
        contracts.web3.eth.getBlockNumber,
        'eth_blockNumber',
        BLOCK_DURATION
      )
    return getBlockNumber()
  },
  net_version: () => {
    if (!version)
      version = cached(
        contracts.web3.eth.net.getId,
        'net_version',
        BLOCK_DURATION * 1000
      )
    return version()
  }
}
