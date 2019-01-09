import { extractCallParams } from './../utils/contract-decoder'
import { Listing } from '../models/listing'
import {
  LISTING_DATA_TYPE
} from '../ipfsInterface/store'


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
      else if (params._ipfsHash)
      {
        const realIpfsHash = this.contractService.getIpfsHashFromBytes32(
          params._ipfsHash
        )
        const ipfsListing = await this.marketplace.ipfsDataStore.load(LISTING_DATA_TYPE, realIpfsHash)
        meta.listing = Listing.init(undefined, { ipfsHash: params._ipfsHash }, ipfsListing)
      }
    }
    else if (meta.contract == 'OriginToken')
    {
      meta.originToken = true
    }
  }

  async extractContractCallMeta(networkId, address, callData) {
    if (!address)
    {
      // this is a new deploy we have no clue what it is...
      return { newDeploy: true }
    }
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
    return {}
  }
}

