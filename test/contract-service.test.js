import { expect } from "chai"
import ContractService from "../src/services/contract-service"
import { ipfsHashes } from "./fixtures"
import Web3 from "web3"

const methodNames = [
  "submitListing",
  "getBytes32FromIpfsHash",
  "getIpfsHashFromBytes32"
]

describe("ContractService", function() {
  this.timeout(5000) // default is 2000

  let contractService

  before(async () => {
    let provider = new Web3.providers.HttpProvider("http://localhost:8545")
    let web3 = new Web3(provider)
    contractService = new ContractService({ web3 })

    // Ensure that there is at least 1 sample listing
    await contractService.submitListing(
      "Qmbjig3cZbUUufWqCEFzyCppqdnmQj3RoDjJWomnqYGy1f",
      "0.00001",
      1
    )
  })

  methodNames.forEach(methodName => {
    it(`should have ${methodName} method`, () => {
      expect(contractService[methodName]).to.be.an.instanceof(Function)
    })
  })

  describe("getBytes32FromIpfsHash", () => {
    ipfsHashes.forEach(({ ipfsHash, bytes32 }) => {
      it(`should correctly convert from IPFS hash ${ipfsHash}`, () => {
        const result = contractService.getBytes32FromIpfsHash(ipfsHash)
        expect(result).to.equal(bytes32)
      })
    })
  })

  describe("getIpfsHashFromBytes32", () => {
    ipfsHashes.forEach(({ ipfsHash, bytes32 }) => {
      it(`should correctly convert to IPFS hash ${ipfsHash}`, () => {
        const result = contractService.getIpfsHashFromBytes32(bytes32)
        expect(result).to.equal(ipfsHash)
      })
    })
  })

  describe("submitListing", () => {
    // Skipped by default because it pops up MetaMask confirmation dialogue every time you make a
    // change which slows down dev. Should add alternate tests that mock MetaMask and only enable
    // this one as part of manual testing before releases to ensure library works with MetaMask.
    it("should successfully submit listing", async () => {
      await contractService.submitListing(
        "Qmbjig3cZbUUufWqCEFzyCppqdnmQj3RoDjJWomnqYGy1f",
        "0.00001",
        1
      )
    })
  })

  describe("getAllListingIds", () => {
    it("should get an array of numbers", async () => {
      const result = await contractService.getAllListingIds()
      expect(result).to.be.an("array")
      result.forEach(id => expect(id).to.be.a("number"))
    })
  })

  describe("getListing", () => {
    // Skipped because of https://github.com/OriginProtocol/platform/issues/27
    it("should reject when listing cannot be found", done => {
      contractService.getListing("foo").then(done.fail, error => {
        expect(error).to.match(/Error fetching listingId/)
        done()
      })
    })

    it("should get a listing object", async () => {
      const ids = await contractService.getAllListingIds()
      expect(ids.length).to.be.greaterThan(0)
      const listing = await contractService.getListing(ids[0])
      expect(listing).to.have.keys(
        "address",
        "index",
        "lister",
        "ipfsHash",
        "price",
        "unitsAvailable"
      )
    })
  })

  describe("passing in contract addresses", () => {
    it("should allow contract addresses to be overridden", () => {
      const web3 = new Web3()
      const userAddress = "0x1234567890123456789012345678901234567890"
      const registryAddress = "0x9876543210987654321098765432109876543210"
      const contractAddresses = {
        userRegistryContract: { 4: { address: userAddress } },
        listingsRegistryContract: { 4: { address: registryAddress } }
      }

      var contSrv = new ContractService({ web3, contractAddresses })

      expect(contSrv.userRegistryContract.networks[4].address).to.equal(
        userAddress
      )
      expect(contSrv.listingsRegistryContract.networks[4].address).to.equal(
        registryAddress
      )
    })
  })
})
