class ResourceBase {
  constructor({ contractService, ipfsService }) {
    this.contractService = contractService
    this.ipfsService = ipfsService
  }
  /**
   * Runs a call or transaction on a this resource's smart contract.
   *
   * This handles getting the contract, using the correct account,
   * and building our own response for origin transactions.
   *
   * If doing a blockchain call, this returns the data returned by
   * the contract function.
   *
   * If running a transaction, this returns an object with a
   *   - tx - transaction hash
   *   - whenFinished - a promise that resolves when the transaction is mined
   *
   * @param {string} address - address of the contract
   * @param {string} functionName - contract function to be run
   * @param {*[]} args - args for the transaction or call.
   * @param {{gas: number, value:(number | BigNumber)}} options - transaction options for w3
   */
  async contractFn(address, functionName, args = [], options = {}) {
    // Setup options
    const opts = Object.assign(options, {}) // clone options
    opts.from = opts.from || (await this.contractService.currentAccount())
    opts.gas = options.gas || 50000 // Default gas
    // Get contract and run trasaction
    const contractDefinition = this.contractDefinition
    const contract = await this.contractService.deployed(contractDefinition)
    contract.options.address = address

    const method = contract.methods[functionName].apply(contract, args)
    if (method._method.constant) {
      return await method.call(opts)
    }
    var transaction = await new Promise((resolve, reject) => {
      method
        .send(opts)
        .on("receipt", receipt => {
          resolve(receipt)
        })
        .on("error", err => reject(err))
    })

    transaction.tx = transaction.transactionHash
    // Decorate transaction with whenFinished promise
    if (transaction.tx !== undefined) {
      transaction.whenFinished = async () => {
        await this.contractService.waitTransactionFinished(transaction.tx)
      }
    }
    return transaction
  }
}

export default ResourceBase
