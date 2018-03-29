// For now, we are just wrapping the methods that are already in
// contractService and ipfsService.

module.exports = {
  get: async function(listingIndex) {
    const contractData = await this.origin.contractService.getListing(
      listingIndex
    );
    const ipfsData = await this.origin.ipfsService.getListing(
      contractData.ipfsHash
    );
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
      price: contractData.price,
      unitsAvailable: contractData.unitsAvailable
    };

    // TODO: Validation

    return listing;
  },

  buy: async function(listingAddress, unitsToBuy, ethToPay) {
    return await this.origin.contractService.buyListing(
      listingAddress,
      unitsToBuy,
      ethToPay
    );
  }
};
