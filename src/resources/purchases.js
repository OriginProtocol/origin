import ResourceBase from './_resource-base'

const appendSlash = url => {
  return url.substr(-1) === '/' ? url : url + '/'
}

const _STAGES_TO_NUMBER = {
  awaiting_payment: 0,
  awaiting_seller_approval: 1,
  seller_rejected: 2,
  in_escrow: 3,
  buyer_pending: 4,
  seller_pending: 5,
  in_dispute: 6,
  review_period: 7,
  complete: 8
}
const _NUMBERS_TO_STAGE = {}

const EMPTY_IPFS =
  '0x0000000000000000000000000000000000000000000000000000000000000000'

class Purchases extends ResourceBase {
  constructor({ contractService, ipfsService, fetch, indexingServerUrl }) {
    super({ contractService, ipfsService })

    this.contractDefinition = this.contractService.purchaseContract
    this.fetch = fetch
    this.indexingServerUrl = indexingServerUrl

    Object.entries(_STAGES_TO_NUMBER).forEach(([k, v]) => {
      _NUMBERS_TO_STAGE[v] = k
    })
  }

  // fetches all purchases (all data included)
  async all() {
    try {
      return await this.allIndexed()
    } catch (error) {
      console.error(error)
      console.log('Cannot get all purchases')
      throw error
    }
  }

  async get(address) {
    const contractData = await this.contractFn(address, 'data')

    const ipfsHashBytes32 = contractData[5]
    let ipfsData = {}
    if (ipfsHashBytes32 && (ipfsHashBytes32 !== EMPTY_IPFS)) {
      const ipfsHash = this.contractService.getIpfsHashFromBytes32(
        ipfsHashBytes32
      )
      ipfsData = await this.ipfsService.getFile(ipfsHash)
    }

    return {
      address: address,
      stage: _NUMBERS_TO_STAGE[contractData[0]],
      listingAddress: contractData[1],
      buyerAddress: contractData[2],
      created: Number(contractData[3]),
      buyerTimeout: Number(contractData[4]),
      ipfsData
    }
  }

  async pay(address, amountWei) {
    return await this.contractFn(address, 'pay', [], { value: amountWei })
  }

  async sellerApprove(address) {
    return await this.contractFn(address, 'sellerApprove', [], {
      gas: 80000
    })
  }

  async sellerReject(address) {
    return await this.contractFn(address, 'sellerReject', [], {
      gas: 80000
    })
  }

  async sellerConfirmShipped(address) {
    return await this.contractFn(address, 'sellerConfirmShipped', [], {
      gas: 80000
    })
  }

  async buyerConfirmReceipt(address, data = {}) {
    const review = await this._buildReview(data)
    const args = [review.rating, review.ipfsHashBytes]
    return await this.contractFn(address, 'buyerConfirmReceipt', args)
  }

  async sellerGetPayout(address, data = {}) {
    const review = await this._buildReview(data)
    const args = [review.rating, review.ipfsHashBytes]
    return await this.contractFn(address, 'sellerCollectPayout', args, {
      gas: 100000
    })
  }

  async _buildReview(data = {}) {
    // Check Rating
    const rating = data.rating || 5
    if (!(rating >= 1 && rating <= 5)) {
      throw new Error('You must set a rating between 1 and 5')
    }
    // IPFS for review text, if needed
    let ipfsHashBytes = EMPTY_IPFS
    const reviewText = data.reviewText
    if (reviewText && typeof reviewText == 'string' && reviewText.length > 2) {
      const ipfsData = { version: 1, reviewText: reviewText }
      const ipfsHash = await this.ipfsService.submitFile(ipfsData)
      ipfsHashBytes = this.contractService.getBytes32FromIpfsHash(ipfsHash)
    }
    // Return review data
    return { rating: rating, ipfsHashBytes: ipfsHashBytes }
  }

  async getLogs(address) {
    const self = this
    const web3 = this.contractService.web3
    const contract = new web3.eth.Contract(this.contractDefinition.abi, address)
    return new Promise((resolve, reject) => {
      // Get all logs on this contract
      contract.getPastEvents(
        'PurchaseChange',
        { fromBlock: 0, toBlock: 'latest' },
        function(error, rawLogs) {
          if (error) {
            return reject(error)
          }
          // Format logs we receive
          const logs = rawLogs.map(log => {
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
        }
      )
    })
  }

  /*
      private
  */

  async allIndexed() {
    const url = appendSlash(this.indexingServerUrl) + 'purchase'
    const response = await this.fetch(url, { method: 'GET' })
    const json = await response.json()
    return json.objects.map(obj => {
      return {
        address: obj['contract_address'],
        buyerAddress: obj['buyer_address'],
        // https://github.com/OriginProtocol/origin-bridge/issues/102
        buyerTimeout: +new Date(obj['buyer_timeout']),
        created: +new Date(obj['created_at']),
        listingAddress: obj['listing_address'],
        stage: obj['stage']
      }
    })
  }
}

module.exports = Purchases
