import contracts from '../contracts'

let timestamps = {}
try {
  timestamps = JSON.parse(window.localStorage.blocktimes)
} catch (e) {
  /* Ignore */
}

export default {
  block: event =>
    new Promise(async (resolve, reject) => {
      const id = event.blockNumber
      contracts.web3.eth
        .getBlock(id)
        .then(block => resolve({ ...block, id }))
        .catch(reject)
    }),
  timestamp: event =>
    new Promise(async (resolve, reject) => {
      if (timestamps[event.blockNumber]) {
        return resolve(timestamps[event.blockNumber])
      }
      contracts.web3.eth
        .getBlock(event.blockNumber)
        .then(block => {
          timestamps[event.blockNumber] = block.timestamp
          if (typeof window !== 'undefined') {
            window.localStorage.blocktimes = JSON.stringify(timestamps)
          }
          resolve(block.timestamp)
        })
        .catch(reject)
    })
}
