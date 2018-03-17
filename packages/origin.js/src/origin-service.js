import contractService from './contract-service'
import ipfsService from './ipfs-service'
import userSchema from './schemas/user.json'

var Ajv = require('ajv')
var ajv = new Ajv()

class OriginService {
  static instance

  async submitListing(formListing, selectedSchemaType) {

    const jsonBlob = {
      'schema': `http://localhost:3000/schemas/${selectedSchemaType.type}.json`,
      'data': formListing.formData,
    }

    let ipfsHash;
    try {
      // Submit to IPFS
      ipfsHash = await ipfsService.submitListing(jsonBlob)
    } catch (error) {
      throw new Error(`IPFS Failure: ${error}`)
    }

    console.log(`IPFS file created with hash: ${ipfsHash} for data:`)
    console.log(jsonBlob)

    // Submit to ETH contract
    const units = 1 // TODO: Allow users to set number of units in form
    let transactionReceipt;
    try {
      transactionReceipt = contractService.submitListing(
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

  getListing(listingIndex) {
    return new Promise((resolve, reject) => {
      let userAddress
      let listingData
      contractService.getListing(listingIndex)
      .then(({ lister, ipfsHash, price, unitsAvailable }) => {
        userAddress = lister
        return ipfsService.getListing(ipfsHash)
      })
      .then((listingJson) => {
        listingData = JSON.parse(listingJson).data
        return contractService.getUser(userAddress)
      })
      .then((ipfsHash) => {
        return ipfsService.getUser(ipfsHash)
      })
      .then((userData) => {
        resolve({ listing: listingData, user: userData })
      })
      .catch((error) => {
        reject(`Error fetching contract or IPFS info for listingId: ${listingIndex}`)
      })
    })
  }

  setUser(data) {
    return new Promise((resolve, reject) => {
      var validate = ajv.compile(userSchema)
      if (!validate(data)) {
        reject('invalid user data')
      } else {
        // Submit to IPFS
        ipfsService.submitUser(data)
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

const originService = new OriginService()

export default originService
