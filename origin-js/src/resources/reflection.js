import { extractCallParams } from './../utils/contract-decoder'

export default class Reflection {
  constructor({ contractService, marketplace, token }) {
    this.contractService = contractService
    this.marketplace = marketplace
    this.token = token
  }

  async _addOriginMeta(networkId, address, meta) {
    if (this.contractService.marketplaceContracts[meta.contract])
    {
      meta.marketplace = true
      const params = meta.params
      if (params.listingID)
      {
        // listingId is actually the listingIndex
        const listingId = this.marketplace.resolver.makeListingId(networkId, meta.contract, params.listingID)
        meta.listing = await this.marketplace.getListing(listingId)
      }
      else if (meta.method.startsWith('createListing') && params._ipfsHash)
      {
        meta.listing = await this.marketplace.ipfsService.getFile(params._ipfsHash)
      }
    }
    else if (meta.contract == 'OriginToken')
    {
      meta.originToken = true
    }
  }

  async extractContractCallMeta(networkId, address, callData) {
    const web3 = this.contractService.web3
    const contracts = Object.values(this.contractService.contracts)
    for (const contract of contracts) {
      if(contract.networks[networkId] && contract.networks[networkId].address == address) {
        // data 0-8 is the first 4 bytes or the function signature...
        const meta = extractCallParams(web3, contract.abi, callData.substr(0, 10), '0x' + callData.substr(10))
        meta.contract = contract.contractName
        await this._addOriginMeta(networkId, address, meta)

        if (meta.name == 'approveAndCallWithSender') {
          const subAddress = meta.params[1].value
          for (const subContract of contracts) {
            if (subContract.networks[networkId] && subContract.networks[networkId].address == subAddress) {
              const subMeta = extractCallParams(web3, subContract.abi, meta.params[2].value, meta.params[3].value, 1)
              subMeta.contract = subContract.contractName
              await this._addOriginMeta(networkId, subAddress, subMeta)
              meta.subMeta = subMeta
            }
          }
        }
        return meta
      }
    }
  }
}

