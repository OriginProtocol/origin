class Purchases {
    constructor({ contractService, ipfsService }) {
      this.contractService = contractService
      this.ipfsService = ipfsService
    }

    async contractFn(address, functionName, args=[]){
        const purchaseContract = this.contractService.purchaseContract
        const purchase = await purchaseContract.at(address)
        const account = await this.contractService.currentAccount()
        args.push({ from: account })
        return await purchase[functionName](args)
    }

    async get(address){
        const contractData = await this.contractFn(
            address,
            'data'
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