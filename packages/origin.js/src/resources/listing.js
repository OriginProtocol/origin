
// Very temp

module.exports = {
    get: async function(listingId){
        const contractData = await this.origin.contractService.getListing(listingId)
        const ipfsData = await this.origin.ipfsService.getListing(contractData.ipfsHash)
        // TODO: ipfsService should have already checked the contents match the hash, and that the signature validates

        const listing = {
            'name': ipfsData.data.name,
            'category': ipfsData.data.category,
            'description': ipfsData.data.description,
            'location': ipfsData.data.location,
            'pictures': ipfsData.data.pictures,
            
            'address': contractData.address,
            'index': contractData.index,
            'ipfsHash': contractData.ipfsHash,
            'sellerAddress': contractData.lister,
            'price': contractData.price,
            'unitsAvailable': contractData.unitsAvailable,
        }

        // TODO: Validation

        return listing
    }
}