class Purchases {
  constructor({ contractService, ipfsService }) {
    this.contractService = contractService
    this.ipfsService = ipfsService

    this._STAGES_TO_NUMBER = {
      awaiting_payment: 0,
      shipping_pending: 1,
      buyer_pending: 2,
      seller_pending: 3,
      in_dispute: 4,
      review_period: 5,
      complete: 6
    }
    this._NUMBERS_TO_STAGE = {}

    this.STAGES = {}
    Object.entries(this._STAGES_TO_NUMBER).map(([k, v]) => {
      this.STAGES[k.toUpperCase()] = k
      this._NUMBERS_TO_STAGE[v] = k
    })
  }

  async contractFn(address, functionName, args = [], value = 0) {
    const purchaseContract = this.contractService.purchaseContract
    const purchase = await purchaseContract.at(address)
    const account = await this.contractService.currentAccount()
    args.push({ from: account, value: value })
    return await purchase[functionName].apply(purchase, args)
  }

  async get(address) {
    const contractData = await this.contractFn(address, "data")
    return {
      address: address,
      stage: this._NUMBERS_TO_STAGE[contractData[0]],
      listingAddress: contractData[1],
      buyerAddress: contractData[2],
      created: contractData[3],
      buyerTimout: contractData[4]
    }
  }

  async pay(address, amountWei) {
    return await this.contractFn(address, "pay", [], amountWei)
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
