// For now, we are just wrapping the methods that are already in
// contractService and ipfsService.

import ResourceBase from './_resource-base'
import Ajv from 'ajv'
import ajvEnableMerge from 'ajv-merge-patch/keywords/merge'
import listingSchema from '../schemas/listing.json'
import unitListingSchema from '../schemas/unit-listing.json'
import fractionalListingSchema from '../schemas/fractional-listing.json'

const unitListingType = 'unit'
const fractionalListingType = 'fractional'

const unitSchemaId = 'unit-listing.json'
const fractionalSchemaId = 'fractional-listing.json'

const ajv = new Ajv({
  schemas: [listingSchema, unitListingSchema, fractionalListingSchema]
})
ajvEnableMerge(ajv)

const validateUnitListing = ajv.getSchema(unitSchemaId)
const validateFractionalListing = ajv.getSchema(fractionalSchemaId)

const appendSlash = url => {
  return url.substr(-1) === '/' ? url : url + '/'
}

function validate(validateFn, data, schema) {
  if (!validateFn(data)) {
    throw new Error(
      `Data invalid for schema. Data: ${JSON.stringify(
        data
      )}. Schema: ${JSON.stringify(schema)}`
    )
  }
}

class Listings extends ResourceBase {
  constructor({
    contractService,
    ipfsService,
    fetch,
    indexingServerUrl,
    purchases
  }) {
    super({ contractService, ipfsService })
    this.contractDefinition = this.contractService.listingContract
    this.fetch = fetch
    this.indexingServerUrl = indexingServerUrl
    this.purchases = purchases
  }

  /*
      Public mehods
  */

  // fetches all listings (all data included)
  async all({ noIndex = false } = {}) {
    try {
      if (noIndex) {
        const ids = await this.allIds()

        return await Promise.all(ids.map(this.getByIndex.bind(this)))
      } else {
        return await this.allIndexed()
      }
    } catch (error) {
      console.error(error)
      console.log('Cannot get all listings')
      throw error
    }
  }

  async allIds() {
    const range = (start, count) =>
      Array.apply(0, Array(count)).map((element, index) => index + start)

    let instance
    try {
      instance = await this.contractService.deployed(
        this.contractService.listingsRegistryContract
      )
    } catch (error) {
      console.log('Contract not deployed')
      throw error
    }

    // Get total number of listings
    let listingsLength
    try {
      listingsLength = await instance.methods.listingsLength().call()
    } catch (error) {
      console.log(error)
      console.log('Cannot get number of listings')
      throw error
    }

    return range(0, Number(listingsLength))
  }

  async allAddresses() {
    const contract = this.contractService.listingsRegistryContract
    const deployed = await this.contractService.deployed(contract)
    const events = await deployed.getPastEvents('NewListing', {
      fromBlock: 0,
      toBlock: 'latest'
    })
    return events.map(({ returnValues }) => {
      return returnValues['_address']
    })
  }

  async get(address) {
    const listing = await this.contractService.deployed(
      this.contractService.listingContract,
      address
    )
    const ipfsHashBytes32 = await listing.methods.ipfsHash().call()
    const ipfsHash = this.contractService.getIpfsHashFromBytes32(
      ipfsHashBytes32
    )
    const ipfsJson = await this.ipfsService.getFile(ipfsHash)
    const ipfsData = ipfsJson ? ipfsJson.data : {}

    ipfsData.listingType = ipfsData.listingType || unitListingType

    if (ipfsData.listingType === unitListingType) {
      return await this.getUnitListing(address, ipfsData, ipfsHash)
    } else if (ipfsData.listingType === fractionalListingType) {
      return await this.getFractionalListing(address, ipfsData, ipfsHash)
    } else {
      throw new Error('Invalid listing type:', ipfsData.listingType)
    }
  }

  // This method is DEPRECATED
  async getByIndex(listingIndex) {
    const listingsRegistry = await this.contractService.deployed(
      this.contractService.listingsRegistryContract
    )
    const listingAddress = await listingsRegistry.methods
      .getListingAddress(listingIndex)
      .call()
    return await this.get(listingAddress)
  }

  async create(data, schemaType, confirmationCallback) {
    const listingType = data.listingType || unitListingType
    data.listingType = listingType // in case it wasn't set
    if (listingType === unitListingType) {
      return await this.createUnit(data, schemaType, confirmationCallback)
    } else if (listingType === fractionalListingType) {
      return await this.createFractional(data, confirmationCallback)
    }
  }

  async update(address, data = {}) {
    if (data.listingType !== fractionalListingType) {
      throw new Error(
        `This listing type (${data.listingType}) cannot be updated.`
      )
    }
    return await this.updateFractional(address, data)
  }

  async buy(address, unitsToBuy, ethToPay, confirmationCallback) {
    // TODO: ethToPay should really be replaced by something that takes Wei.
    const value = this.contractService.web3.utils.toWei(
      String(ethToPay),
      'ether'
    )
    return await this.contractService.contractFn(
      this.contractService.unitListingContract,
      address,
      'buyListing',
      [unitsToBuy],
      {
        value: value,
        gas: 850000
      },
      confirmationCallback
    )
  }

  async request(address, ifpsData, ethToPay, confirmationCallback) {
    // TODO: ethToPay should really be replaced by something that takes Wei.
    const value = this.contractService.web3.utils.toWei(
      String(ethToPay),
      'ether'
    )
    const ipfsHash = await this.ipfsService.submitFile(ifpsData)
    const ipfsBytes32 = this.contractService.getBytes32FromIpfsHash(ipfsHash)
    return await this.contractService.contractFn(
      this.contractService.fractionalListingContract,
      address,
      'request',
      [ipfsBytes32],
      {
        value: value,
        gas: 850000
      },
      confirmationCallback
    )
  }

  async close(address, confirmationCallback) {
    return await this.contractService.contractFn(
      this.contractService.unitListingContract,
      address,
      'close',
      [],
      {},
      confirmationCallback
    )
  }

  async purchasesLength(address) {
    return Number(
      await this.contractService.contractFn(
        this.contractService.unitListingContract,
        address,
        'purchasesLength'
      )
    )
  }

  async getPurchases(address) {
    const purchasesLength = await this.purchasesLength(address)
    const indices = []
    for (let i = 0; i < purchasesLength; i++) {
      indices.push(i)
    }
    return await Promise.all(
      indices.map(async index => {
        const purchaseAddress = await this.contractService.contractFn(
          this.contractService.listingContract,
          address,
          'getPurchase',
          [index]
        )
        return this.purchases.get(purchaseAddress)
      })
    )
  }

  async purchaseAddressByIndex(address, index) {
    return await this.contractService.contractFn(
      this.contractService.unitListingContract,
      address,
      'getPurchase',
      [index]
    )
  }

  /*
      Private methods
  */

  async createUnit(data, schemaType, confirmationCallback) {
    validate(validateUnitListing, data, unitListingSchema)

    const formListing = { formData: data }

    // TODO: Why can't we take schematype from the formListing object?
    const jsonBlob = {
      schema: `http://localhost:3000/schemas/${schemaType}.json`,
      data: formListing.formData
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

    // For now, accept price in either wei or eth for backwards compatibility
    // `price` is now deprecated. `priceWei` should be used instead.
    const priceEth = String(formListing.formData.price)
    const priceWei = formListing.formData.priceWei
      ? String(formListing.formData.priceWei)
      : this.contractService.web3.utils.toWei(priceEth, 'ether')

    // Submit to ETH contract
    const units = 1 // TODO: Allow users to set number of units in form
    let transactionReceipt
    try {
      transactionReceipt = await this.submitUnitListing(
        ipfsHash,
        priceWei,
        units,
        confirmationCallback
      )
    } catch (error) {
      console.error(error)
      throw new Error(`ETH Failure: ${error}`)
    }
    return transactionReceipt
  }

  async createFractional(data, confirmationCallback) {
    validate(validateFractionalListing, data, fractionalListingSchema)
    const json = { data }

    // Submit to IPFS
    let ipfsHash
    try {
      ipfsHash = await this.ipfsService.submitFile(json)
    } catch (error) {
      throw new Error(`IPFS Failure: ${error}`)
    }

    // Submit to ETH contract
    let transactionReceipt
    try {
      transactionReceipt = await this.submitFractionalListing(
        ipfsHash,
        confirmationCallback
      )
    } catch (error) {
      console.error(error)
      throw new Error(`ETH Failure: ${error}`)
    }

    return transactionReceipt
  }

  async updateFractional(address, data) {
    validate(validateFractionalListing, data, fractionalListingSchema)
    const json = { data }

    // Submit to IPFS
    let ipfsHash
    try {
      ipfsHash = await this.ipfsService.submitFile(json)
    } catch (error) {
      throw new Error(`IPFS Failure: ${error}`)
    }

    // Submit to ETH contract
    let transactionReceipt
    try {
      const account = await this.contractService.currentAccount()
      const instance = await this.contractService.deployed(
        this.contractService.fractionalListingContract,
        address
      )
      const version = await instance.methods.currentVersion().call()
      const ipfsBytes32 = this.contractService.getBytes32FromIpfsHash(ipfsHash)

      transactionReceipt = await this.contractService.contractFn(
        this.contractService.fractionalListingContract,
        address,
        'update',
        [version, ipfsBytes32],
        { from: account, gas: 4476768 }
      )
    } catch (error) {
      console.error('Error submitting to the Ethereum blockchain: ' + error)
      throw error
    }

    return transactionReceipt
  }

  async submitUnitListing(ipfsListing, priceWei, units, confirmationCallback) {
    try {
      const account = await this.contractService.currentAccount()
      return await this.contractService.contractFn(
        this.contractService.listingsRegistryContract,
        null,
        'create',
        [
          this.contractService.getBytes32FromIpfsHash(ipfsListing),
          priceWei,
          units
        ],
        {
          gas: 4476768,
          from: account
        },
        confirmationCallback
      )
    } catch (error) {
      console.error('Error submitting to the Ethereum blockchain: ' + error)
      throw error
    }
  }

  async submitFractionalListing(ipfsListing, confirmationCallback) {
    try {
      const account = await this.contractService.currentAccount()
      return await this.contractService.contractFn(
        this.contractService.listingsRegistryContract,
        null,
        'createFractional',
        [this.contractService.getBytes32FromIpfsHash(ipfsListing)],
        { from: account, gas: 4476768 },
        confirmationCallback
      )
    } catch (error) {
      console.error('Error submitting to the Ethereum blockchain: ' + error)
      throw error
    }
  }

  async allIndexed() {
    const url = appendSlash(this.indexingServerUrl) + 'listing'
    const response = await this.fetch(url, { method: 'GET' })
    const json = await response.json()
    return Promise.all(
      json.objects.map(async obj => {
        const ipfsData = obj['ipfs_data']
        // While we wait on https://github.com/OriginProtocol/origin-bridge/issues/18
        // we fetch the array of image data strings for each listing
        const indexedIpfsData = await this.ipfsService.getFile(obj['ipfs_hash'])
        const pictures = indexedIpfsData.data.pictures
        return {
          address: obj['contract_address'],
          ipfsHash: obj['ipfs_hash'],
          sellerAddress: obj['owner_address'],
          price: Number(obj['price']),
          unitsAvailable: Number(obj['units']),
          created: obj['created_at'],
          expiration: obj['expires_at'],

          name: ipfsData ? ipfsData['name'] : null,
          category: ipfsData ? ipfsData['category'] : null,
          description: ipfsData ? ipfsData['description'] : null,
          location: ipfsData ? ipfsData['location'] : null,
          listingType: ipfsData ? ipfsData['listingType'] : unitListingType,
          pictures
        }
      })
    )
  }

  async getUnitListing(listingAddress, ipfsData, ipfsHash) {
    const listing = await this.contractService.deployed(
      this.contractService.unitListingContract,
      listingAddress
    )
    const contractData = await listing.methods.data().call()
    return {
      address: listingAddress,
      ipfsHash: ipfsHash,
      sellerAddress: contractData[0],
      priceWei: contractData[2].toString(),
      price: this.contractService.web3.utils.fromWei(contractData[2], 'ether'),
      unitsAvailable: Number(contractData[3]),
      created: contractData[4],
      expiration: contractData[5],

      name: ipfsData.name,
      category: ipfsData.category,
      description: ipfsData.description,
      location: ipfsData.location,
      pictures: ipfsData.pictures,
      listingType: ipfsData.listingType,
      schemaType: ipfsData.schemaType
    }
  }

  getFractionalListing(listingAddress, ipfsData, ipfsHash) {
    return {
      address: listingAddress,
      ipfsHash: ipfsHash,
      name: ipfsData.name,
      category: ipfsData.category,
      description: ipfsData.description,
      location: ipfsData.location,
      pictures: ipfsData.pictures,
      listingType: ipfsData.listingType,
      schemaType: ipfsData.schemaType,
      slots: ipfsData.slots
    }
  }
}

module.exports = Listings
