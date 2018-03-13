import { expect } from 'chai';
import originService from '../src/origin-service'

const methodNames = [
  'submitListing'
]

describe('OriginService', () => {

  methodNames.forEach((methodName) => {
    it(`should have ${methodName} method`, () => {
      expect(originService[methodName]).to.be.an.instanceof(Function)
    })
  })

})
