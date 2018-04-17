import ResourceBase from "../ResourceBase"

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


class Purchases extends ResourceBase{
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
      created: contractData[3],
      buyerTimout: contractData[4]
    }
  }

  async pay(address, amountWei) {
    return await this.contractFn(address, "pay", [], {value:amountWei})
  }

  async sellerConfirmShipped(address) {
    return await this.contractFn(address, "sellerConfirmShipped")
  }

  async buyerConfirmReceipt(address) {
    return await this.contractFn(address, "buyerConfirmReceipt")
  }

  async sellerGetPayout(address) {
    return await this.contractFn(address, "sellerCollectPayout")
  }
}

module.exports = Purchases
