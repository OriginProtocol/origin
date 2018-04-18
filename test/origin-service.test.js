import { expect } from "chai"
import ContractService from "../src/contract-service"
import IpfsService from "../src/ipfs-service"
import OriginService from "../src/origin-service"
import Web3 from "web3"

const methodNames = ["submitListing"]

describe("OriginService", () => {
  let contractService
  let ipfsService
  let originService

  beforeEach(() => {
    let provider = new Web3.providers.HttpProvider("http://localhost:8545")
    let web3 = new Web3(provider)
    contractService = new ContractService({ web3 })
    ipfsService = new IpfsService()
    originService = new OriginService({ contractService, ipfsService })
  })

  methodNames.forEach(methodName => {
    it(`should have ${methodName} method`, () => {
      expect(originService[methodName]).to.be.an.instanceof(Function)
    })
  })
})
