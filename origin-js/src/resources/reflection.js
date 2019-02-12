import { extractCallParams } from './../utils/contract-decoder'
import { Listing } from '../models/listing'
import {
  IDENTITY_DATA_TYPE,
  LISTING_DATA_TYPE,
} from '../ipfsInterface/store'


export default class Reflection {
  constructor({ contractService, marketplace, token, users }) {
    this.contractService = contractService
    this.marketplace = marketplace
    this.token = token
    this.users = users
  }

  makeSignedListingId(networkId, listingID) {
    return this.marketplace.resolver.makeListingId(networkId, "VA_Marketplace", listingID)
  }

  async _addOriginMeta(networkId, address, meta) {
    if (this.contractService.marketplaceContracts[meta.contract])
    {
      meta.marketplace = true
      if (meta.params.listingID)
      {
        // listingId is actually the listingIndex
        const listingId = this.marketplace.resolver.makeListingId(networkId, meta.contract, meta.params.listingID)
        meta.listing = await this.marketplace.getListing(listingId)
      }
      else if (meta.params._ipfsHash)
      {
        const realIpfsHash = this.contractService.getIpfsHashFromBytes32(
          meta.params._ipfsHash
        )
        const ipfsListing = await this.marketplace.ipfsDataStore.load(LISTING_DATA_TYPE, realIpfsHash)
        meta.listing = Listing.init(undefined, { ipfsHash: meta.params._ipfsHash }, ipfsListing)
      }
    }
    else if (meta.contract === 'IdentityEvents')
    {
      console.log('ipfsPro', meta)
      meta.users = true
      if (meta.params.ipfsHash) {
        const realIpfsHash = this.contractService.getIpfsHashFromBytes32(
          meta.params.ipfsHash
        )
        meta.identity = await this.users.ipfsDataStore.load(IDENTITY_DATA_TYPE, realIpfsHash)
      }
    }
    else if (meta.contract === 'OriginToken')
    {
      meta.originToken = true
      if (meta.params._value) {
        meta.originTokenValue = meta.params._value
      }
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
      if(contract.networks[networkId] && contract.networks[networkId].address == address.toLowerCase()) {
        // data 0-8 is the first 4 bytes or the function signature...
        const meta = extractCallParams(web3, contract.abi, callData.substr(0, 10), '0x' + callData.substr(10))
        meta.contract = contract.contractName
        await this._addOriginMeta(networkId, address, meta)

        if (meta.method == 'approveAndCallWithSender' && meta.params._spender &&
          meta.params._selector && meta.params._callParams) {
          const subAddress = meta.params._spender
          for (const subContract of contracts) {
            if (subContract.networks[networkId] && subContract.networks[networkId].address == subAddress.toLowerCase()) {
              const subMeta = extractCallParams(web3, subContract.abi, meta.params._selector, meta.params._callParams, 1)
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

