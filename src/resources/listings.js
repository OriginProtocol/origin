// For now, we are just wrapping the methods that are already in
// contractService and ipfsService.

import ResourceBase from "./_resource-base"

class Listings extends ResourceBase {
  constructor({ contractService, ipfsService }) {
    super({ contractService, ipfsService })
    this.contractDefinition = this.contractService.listingContract
  }

  async allIds() {
    return await this.contractService.getAllListingIds()
  }

  async get(address) {
    const contractData = await this.contractFn(address, "data")
    let ipfsHash = this.contractService.getIpfsHashFromBytes32(contractData[1])
    const ipfsData = await this.ipfsService.getFile(ipfsHash)

    let listing = {
      address: address,
      ipfsHash: ipfsHash,
      sellerAddress: contractData[0],
      priceWei: contractData[2].toString(),
      price: this.contractService.web3.utils.fromWei(contractData[2], "ether"),
      unitsAvailable: contractData[3],
      created: contractData[4],
      expiration: contractData[5],

      name: ipfsData.data.name,
      category: ipfsData.data.category,
      description: ipfsData.data.description,
      location: ipfsData.data.location,
      pictures: ipfsData.data.pictures
    }

    return listing
  }

  // This method is DEPRCIATED
  async getByIndex(listingIndex) {
    const contractData = await this.contractService.getListing(listingIndex)
    const ipfsData = await this.ipfsService.getFile(contractData.ipfsHash)
    // ipfsService should have already checked the contents match the hash,
    // and that the signature validates

    // We explicitly set these fields to white list the allowed fields.
    const listing = {
      name: ipfsData.data.name,
      category: ipfsData.data.category,
      description: ipfsData.data.description,
      location: ipfsData.data.location,
      pictures: ipfsData.data.pictures,

      address: contractData.address,
      index: contractData.index,
      ipfsHash: contractData.ipfsHash,
      sellerAddress: contractData.lister,
      price: Number(contractData.price),
      unitsAvailable: Number(contractData.unitsAvailable)
    }

    // TODO: Validation

    return listing
  }

  async create(data, schemaType) {
    if (data.price == undefined) {
      throw "You must include a price"
    }
    if (data.name == undefined) {
      throw "You must include a name"
    }

    let formListing = { formData: data }

    // TODO: Why can't we take schematype from the formListing object?
    const jsonBlob = {
      'schema': `http://localhost:3000/schemas/${schemaType}.json`,
      'data': formListing.formData,
    }

    let ipfsHash
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
    let transactionReceipt
    try {
      transactionReceipt = await this.contractService.submitListing(
        ipfsHash,
        formListing.formData.price,
        units)
    } catch (error) {
      console.error(error)
      throw new Error(`ETH Failure: ${error}`)
    }

    // Success!
    console.log(`Submitted to ETH blockchain with transactionReceipt.tx: ${transactionReceipt.tx}`)
    return transactionReceipt
  }

  async buy(address, unitsToBuy, ethToPay) {
    // TODO: ethToPay should really be replaced by something that takes Wei.
    const value = this.contractService.web3.utils.toWei(String(ethToPay), "ether")
    return await this.contractFn(address, "buyListing", [unitsToBuy], {value:value, gas: 750000})
  }

  async close(address) {
    return await this.contractFn(address, "close")
  }

  async purchasesLength(address) {
    return Number(await this.contractFn(address, "purchasesLength"))
  }

  async purchaseAddressByIndex(address, index) {
    return await this.contractFn(address, "getPurchase", [index])
  }
}

module.exports = Listings
