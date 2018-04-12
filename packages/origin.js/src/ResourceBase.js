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
    const result = await contract[functionName].apply(contract, args)
    if (result.tx != undefined) {
      result.whenMined = async () => {
        await this.contractService.waitTransactionFinished(result.tx)
      }
    }
    return result
  }
}

export default ResourceBase
