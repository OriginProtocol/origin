class Purchases {
    constructor({ contractService, ipfsService }) {
      this.contractService = contractService
      this.ipfsService = ipfsService
    }

    async get(address){
        const purchaseContract = this.contractService.purchaseContract
        const purchase = await purchaseContract.at(address)
        const account = await this.contractService.currentAccount()
        const contractData = await purchase.data(
            { from: account }
        )
        return {
            address: address,
            stage: contractData[0],
            listingAddress: contractData[1],
            buyerAddress: contractData[2],
            created: contractData[3],
            buyerTimout: contractData[4]
        }
    }
}  

module.exports = Purchases