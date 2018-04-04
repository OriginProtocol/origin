import { expect } from 'chai';
import ContractService from '../src/contract-service'
import IpfsService from '../src/ipfs-service'
import OriginService from '../src/origin-service'

const methodNames = [
  'submitListing'
]

describe('OriginService', () => {

  let contractService
  let ipfsService
  let originService

  beforeEach(() => {
    contractService = new ContractService()
    ipfsService = new IpfsService()
    originService = new OriginService({ contractService, ipfsService })
  })

  methodNames.forEach((methodName) => {
    it(`should have ${methodName} method`, () => {
      expect(originService[methodName]).to.be.an.instanceof(Function)
    })
  })

})
