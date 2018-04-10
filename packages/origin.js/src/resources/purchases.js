class Purchases {
    constructor({ contractService, ipfsService }) {
      this.contractService = contractService
      this.ipfsService = ipfsService
    }

    async contractFn(address, functionName, args=[], value=0){
        const purchaseContract = this.contractService.purchaseContract
        const purchase = await purchaseContract.at(address)
        const account = await this.contractService.currentAccount()
        args.push({ from: account, value: value })
        return await purchase[functionName].apply(purchase, args)
    }

    async get(address){
        const contractData = await this.contractFn(
            address,
            'data'
        )
        return {
            address: address,
            stage: contractData[0], // perhaps return a string
            listingAddress: contractData[1],
            buyerAddress: contractData[2],
            created: contractData[3],
            buyerTimout: contractData[4]
        }
    }

    async pay(address, amountWei){
        return await this.contractFn(
            address,
            'pay',
            [],
            amountWei
        )
    }
}  

module.exports = Purchases