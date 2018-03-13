import { expect } from 'chai';
import userRegistryService from '../src/user-registry-service'

const methodNames = [
  'create',
  'get'
]

describe('UserRegistryService', () => {

  methodNames.forEach((methodName) => {
    it(`should have ${methodName} method`, () => {
      expect(userRegistryService[methodName]).to.be.an.instanceof(Function)
    })
  })

  // TODO: Real tests

})
