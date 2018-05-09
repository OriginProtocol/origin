import ResourceBase from "./_resource-base"

const _STAGES_TO_NUMBER = {
  awaiting_payment: 0,
  shipping_pending: 1,
  buyer_pending: 2,
  seller_pending: 3,
  in_dispute: 4,
  review_period: 5,
  complete: 6
}
const _NUMBERS_TO_STAGE = {}

class Purchases extends ResourceBase {
  constructor({ contractService, ipfsService }) {
    super({ contractService, ipfsService })

    this.contractDefinition = this.contractService.purchaseContract

    Object.entries(_STAGES_TO_NUMBER).forEach(([k, v]) => {
      _NUMBERS_TO_STAGE[v] = k
    })
  }

  async get(address) {
    const contractData = await this.contractFn(address, "data")
    return {
      address: address,
      stage: _NUMBERS_TO_STAGE[contractData[0]],
      listingAddress: contractData[1],
      buyerAddress: contractData[2],
      created: Number(contractData[3]),
      buyerTimout: Number(contractData[4])
    }
  }

  async pay(address, amountWei) {
    return await this.contractFn(address, "pay", [], { value: amountWei })
  }

  async sellerConfirmShipped(address) {
    return await this.contractFn(address, "sellerConfirmShipped", [], {
      gas: 80000
    })
  }

  async buyerConfirmReceipt(address) {
    return await this.contractFn(address, "buyerConfirmReceipt")
  }

  async sellerGetPayout(address) {
    return await this.contractFn(address, "sellerCollectPayout")
  }

  async getLogs(address) {
    const self = this
    const web3 = this.contractService.web3
    const contract = new web3.eth.Contract(this.contractDefinition.abi, address)
    return new Promise((resolve, reject) => {
      // Get all logs on this contract
      contract.getPastEvents('allEvents', { fromBlock: 0 }, function(error, rawLogs) {
        if (error) {
          return reject(error)
        }
        // Format logs we receive
        let logs = rawLogs.map(log => {
          const stage = _NUMBERS_TO_STAGE[log.returnValues.stage]
          return {
            transactionHash: log.transactionHash,
            stage: stage,
            blockNumber: log.blockNumber,
            blockHash: log.blockHash,
            event: log.event
          }
        })
        // Fetch user and timestamp information for all logs, in parallel
        const addUserAddressFn = async event => {
          event.from = (await self.contractService.getTransaction(
            event.transactionHash
          )).from
        }
        const addTimestampFn = async event => {
          event.timestamp = (await self.contractService.getBlock(
            event.blockHash
          )).timestamp
        }
        const fetchPromises = [].concat(
          logs.map(addUserAddressFn),
          logs.map(addTimestampFn)
        )
        Promise.all(fetchPromises)
          .then(() => {
            resolve(logs)
          })
          .catch(error => reject(error))
      })
    })
  }
}

module.exports = Purchases
