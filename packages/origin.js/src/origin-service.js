class OriginService {
  constructor({ contractService, ipfsService }) {
    this.contractService = contractService;
    this.ipfsService = ipfsService;
  }

  async submitListing(formListing, selectedSchemaType) {

    // TODO: Why can't we take schematype from the formListing object?
    const jsonBlob = {
      'schema': `http://localhost:3000/schemas/${selectedSchemaType}.json`,
      'data': formListing.formData,
    }

    let ipfsHash;
    try {
      // Submit to IPFS
      ipfsHash = await this.ipfsService.submitFile(jsonBlob)
    } catch (error) {
      throw new Error(`IPFS Failure: ${error}`)
    }

    console.log(`IPFS file created with hash: ${ipfsHash} for data:`)
    console.log(jsonBlob)

    // Submit to ETH contract
    const units = 1 // TODO: Allow users to set number of units in form
    let transactionReceipt;
    try {
      transactionReceipt = await this.contractService.submitListing(
        ipfsHash,
        formListing.formData.price,
        units)
    } catch (error) {
      console.error(error)
      throw new Error(`ETH Failure: ${error}`);
    }

    // Success!
    console.log(`Submitted to ETH blockchain with transactionReceipt.tx: ${transactionReceipt.tx}`)
    return transactionReceipt.tx

  }

  setUser(data) {
    return new Promise((resolve, reject) => {
      var validate = ajv.compile(userSchema)
      if (!validate(data)) {
        reject('invalid user data')
      } else {
        // Submit to IPFS
        ipfsService.submitFile(data)
        .then((ipfsHash) => {
          console.log(`IPFS file created with hash: ${ipfsHash} for data:`)
          console.log(data)

          // Submit to ETH contract
          contractService.setUser(
            ipfsHash)
          .then((transactionReceipt) => {
            // Success!
            console.log(`Submitted to ETH blockchain with transactionReceipt.tx: ${transactionReceipt.tx}`)
            resolve(transactionReceipt.tx)
          })
          .catch((error) => {
            console.error(error)
            reject(`ETH Failure: ${error}`)
          })
        })
        .catch((error) => {
          reject(`IPFS Failure: ${error}`)
        })
      }
    })
  }
}

export default OriginService
