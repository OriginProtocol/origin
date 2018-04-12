class ResourceBase {
  constructor({ contractService, ipfsService }) {
    this.contractService = contractService
    this.ipfsService = ipfsService
  }

  async contractFn(address, functionName, args = [], value = 0) {
    const contractDefinition = this.contractDefinition
    const contract = await contractDefinition.at(address)
    const account = await this.contractService.currentAccount()
    args.push({ from: account, value: value })
    const transaction = await contract[functionName].apply(contract, args)
    if (transaction.tx != undefined) {
      transaction.whenFinished = async () => {
        await this.contractService.waitTransactionFinished(transaction.tx)
      }
    }
    return transaction
  }
}

export default ResourceBase
