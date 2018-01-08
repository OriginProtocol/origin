import ListingContract from '../../build/contracts/Listing.json'
import bs58 from 'bs58'

class ContractService {
  static instance

  constructor() {
    if (ContractService.instance) {
      return ContractService.instance
    }

    ContractService.instance = this;

    this.contract = require('truffle-contract')
    this.listingContract = this.contract(ListingContract)
  }

  // Return bytes32 hex string from base58 encoded ipfs hash,
  // stripping leading 2 bytes from 34 byte IPFS hash
  // Assume IPFS defaults: function:0x12=sha2, size:0x20=256 bits
  // E.g. "QmNSUYVKDSvPUnRLKmuxk9diJ6yS96r1TrAXzjTiBcCLAL" -->
  // "0x017dfd85d4f6cb4dcd715a88101f7b1f06cd1e009b2327a0809d01eb9c91f231"
  getBytes32FromIpfsHash(ipfsListing) {
    return "0x"+bs58.decode(ipfsListing).slice(2).toString('hex')
  }

  // Return base58 encoded ipfs hash from bytes32 hex string,
  // E.g. "0x017dfd85d4f6cb4dcd715a88101f7b1f06cd1e009b2327a0809d01eb9c91f231"
  // --> "QmNSUYVKDSvPUnRLKmuxk9diJ6yS96r1TrAXzjTiBcCLAL"
  getIpfsHashFromBytes32(bytes32Hex) {
    // Add our default ipfs values for first 2 bytes:
    // function:0x12=sha2, size:0x20=256 bits
    // and cut off leading "0x"
    const hashHex = "1220" + bytes32Hex.slice(2)
    const hashBytes = Buffer.from(hashHex, 'hex');
    const hashStr = bs58.encode(hashBytes)
    return hashStr
  }

  submitListing(ipfsListing, ethPrice, units) {
    return new Promise((resolve, reject) => {
      this.listingContract.setProvider(window.web3.currentProvider)
      window.web3.eth.getAccounts((error, accounts) => {
        this.listingContract.deployed().then((instance) => {
          let weiToGive = window.web3.toWei(ethPrice, 'ether')
          // Note we cannot get the listingId returned by our contract.
          // See: https://forum.ethereum.org/discussion/comment/31529/#Comment_31529
          return instance.create(
            this.getBytes32FromIpfsHash(ipfsListing),
            weiToGive,
            units,
            {from: accounts[0]})
        }).then((result) => {
          resolve(result)
        }).catch((error) => {
          console.error("Error submitting to the Ethereum blockchain: " + error)
          reject(error)
        })
      })
    })
  }

  getAllListingIds() {
    return new Promise((resolve, reject) => {
      this.listingContract.setProvider(window.web3.currentProvider)
      this.listingContract.deployed().then((instance) => {
        // Get total number of listings
        instance.listingsLength.call().then((listingsLength) => {
          function range(start, count) {
            return Array.apply(0, Array(count))
              .map(function (element, index) {
                return index + start
            });
          }
          resolve(range(0, Number(listingsLength)))
        })
        .catch((error) => {
          console.log(`Can't get number of listings.`)
          reject(error)
        })
      })
      .catch((error) => {
        console.log(`Contract not deployed`)
        reject(error)
      })
    })
  }

  getListing(listingId) {
    return new Promise((resolve, reject) => {
      this.listingContract.setProvider(window.web3.currentProvider)
      this.listingContract.deployed().then((instance) => {
        instance.getListing.call(listingId)
        .then((listing)  => {
          // Listing is returned as array of properties.
          // IPFS hash (as bytes32 hex string) is in results[2]
          // Convert it to regular IPFS base-58 encoded hash
          const listingObject = {
            index: listing[0].toNumber(),
            lister: listing[1],
            ipfsHash: this.getIpfsHashFromBytes32(listing[2]),
            price: window.web3.fromWei(listing[3], 'ether').toNumber(),
            unitsAvailable: listing[4].toNumber()
          }
          resolve(listingObject)
        })
        .catch((error) => {
          console.log(`Error fetching listingId: ${listingId}`)
          reject(error)
        })
      })
    })
  }

  buyListing(listingIndex, unitsToBuy, ethToGive) {
    console.log("request to buy index #" + listingIndex + ", of this many untes " + unitsToBuy + " units. Total eth to send:" + ethToGive)
    return new Promise((resolve, reject) => {
      this.listingContract.setProvider(window.web3.currentProvider)
      window.web3.eth.getAccounts((error, accounts) => {
        this.listingContract.deployed().then((instance) => {
          let weiToGive = window.web3.toWei(ethToGive, 'ether')
          // Buy it for real
          instance.buyListing(
            listingIndex,
            unitsToBuy,
            {from: accounts[0], value:weiToGive, gas: 4476768} // TODO (SRJ): is gas needed?
          )
          .then((transactionReceipt) => {
            // Success
            resolve(transactionReceipt)
          })
          .catch((error) => {
            console.error(error)
            reject(error)
          })
        })
      })
    })
  }

  waitTransactionFinished(transactionReceipt, pollIntervalMilliseconds=1000) {
    return new Promise((resolve, reject) => {
      let txCheckTimer = setInterval(txCheckTimerCallback, pollIntervalMilliseconds);
      function txCheckTimerCallback() {
        window.web3.eth.getTransaction(transactionReceipt, (error, transaction) => {
          if (transaction.blockNumber != null) {
            console.log(`Transaction mined at block ${transaction.blockNumber}`)
            console.log(transaction)
            // TODO: Wait maximum number of blocks
            // TODO: Confirm transaction *sucessful* with getTransactionReceipt()

            // // TODO (Stan): Metamask web3 doesn't have this method. Probably could fix by
            // // by doing the "copy local web3 over metamask's" technique.
            // window.web3.eth.getTransactionReceipt(this.props.transactionReceipt, (error, transactionReceipt) => {
            //   console.log(transactionReceipt)
            // })

            clearInterval(txCheckTimer)
            // Hack to wait two seconds, as results don't seem to be
            // immediately available.
            setTimeout(()=>resolve(transaction.blockNumber), 2000)
          }
        })
      }
    })
  }
}

const contractService = new ContractService()

export default contractService


