import { expect } from 'chai'
import ContractService from '../src/services/contract-service'
import { ipfsHashes } from './fixtures'
import Web3 from 'web3'

const methodNames = ['getBytes32FromIpfsHash', 'getIpfsHashFromBytes32']

describe('ContractService', function() {
  this.timeout(5000) // default is 2000

  let contractService

  before(async () => {
    const provider = new Web3.providers.HttpProvider('http://localhost:8545')
    const web3 = new Web3(provider)
    contractService = new ContractService({ web3 })
  })

  methodNames.forEach(methodName => {
    it(`should have ${methodName} method`, () => {
      expect(contractService[methodName]).to.be.an.instanceof(Function)
    })
  })

  describe('getBytes32FromIpfsHash', () => {
    ipfsHashes.forEach(({ ipfsHash, bytes32 }) => {
      it(`should correctly convert from IPFS hash ${ipfsHash}`, () => {
        const result = contractService.getBytes32FromIpfsHash(ipfsHash)
        expect(result).to.equal(bytes32)
      })
    })
  })

  describe('getIpfsHashFromBytes32', () => {
    ipfsHashes.forEach(({ ipfsHash, bytes32 }) => {
      it(`should correctly convert to IPFS hash ${ipfsHash}`, () => {
        const result = contractService.getIpfsHashFromBytes32(bytes32)
        expect(result).to.equal(ipfsHash)
      })
    })
  })

  describe('passing in contract addresses', () => {
    it('should allow contract addresses to be overridden', () => {
      const web3 = new Web3()
      const userAddress = '0x1234567890123456789012345678901234567890'
      const contractAddresses = {
        userRegistryContract: { 4: { address: userAddress } }
      }

      const contSrv = new ContractService({ web3, contractAddresses })

      expect(contSrv.contracts.UserRegistry.networks[4].address).to.equal(
        userAddress
      )
    })
  })
})
