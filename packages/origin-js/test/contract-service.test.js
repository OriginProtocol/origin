import { expect } from 'chai'
import ContractService from '../src/services/contract-service'
import { ipfsHashes } from './fixtures'
import Web3Mock from './helpers/web3-mock'
import Money from '../src/models/money'
import Web3 from 'web3'

const methodNames = ['getBytes32FromIpfsHash', 'getIpfsHashFromBytes32']

describe('ContractService', function() {
  this.timeout(5000) // default is 2000

  let contractService

  beforeEach(async () => {
    const provider = new Web3.providers.HttpProvider('http://localhost:8545')
    const web3 = new Web3(provider)
    contractService = new ContractService({
      web3,
      currencies: {
        FOO: { address: '0x1234', decimals: 3 },
        BAR: { address: '0x1234' }
      }
    })
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

  describe('moneyToUnits', () => {
    beforeEach(async () => {
      contractService._currencies = {
        FOO: { address: '0x1234', decimals: 3 },
        BAR: { address: '0x1234' }
      }
    })

    it(`should handle ERC20 token`, async () => {
      const money = new Money({ amount: 123, currency: 'FOO' })
      const units = await contractService.moneyToUnits(money)
      expect(units).to.equal('123000')
    })

    it(`should handle ETH`, async () => {
      const money = new Money({ amount: 123, currency: 'ETH' })
      const units = await contractService.moneyToUnits(money)
      expect(units).to.equal('123000000000000000000')
    })

    it(`should handle undefined currency decimals`, async () => {
      const money = new Money({ amount: 123, currency: 'BAR' })
      const units = await contractService.moneyToUnits(money)
      expect(units).to.equal('123')
    })
  })

  describe('passing in contract addresses', () => {
    it('should allow contract addresses to be overridden', () => {
      const web3 = new Web3()
      const userAddress = '0x1234567890123456789012345678901234567890'
      const contractAddresses = {
        V00_UserRegistry: { 4: { address: userAddress } }
      }

      const contSrv = new ContractService({ web3, contractAddresses })

      expect(contSrv.contracts.V00_UserRegistry.networks[4].address).to.equal(
        userAddress
      )
    })
  })

  describe('currencies', () => {
    it('should include OGN', async () => {
      const currencies = await contractService.currencies()
      expect(currencies).to.be.an('object')
      const OGN = currencies.OGN
      expect(OGN).to.be.an('object')
      expect(OGN.address).to.be.a('string')
      expect(OGN.address).to.include('0x')
      expect(OGN.decimals).to.equal(18)
    })
  })

  describe('interacting with web3', () => {
    async function callAddClaimsWithParameters(web3Properties, callArguments){
      const web3Mock = new Web3Mock(web3Properties)

      contractService.web3 = web3Mock
      return await contractService.call(
        'OriginToken',
        'addClaims',
        [
          [13], // topic
          ['0x0000000000000000000000000000000000000000'], // issuer
          '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', // signature
          '0xa03bfc3f155d4c833cb86f27b403bd353c68601c7cfa646509529aecfed88192', // data
          [32] // offsets
        ],
        callArguments
      )
    }

    it('should receive a confirmation callback', (done) => {
      /* need to double wrap because of mocha doesn't support async function and done callback at the same time
       * https://github.com/mochajs/mocha/issues/2407
       */
      (async () => {
        let doneCalled = false
        await callAddClaimsWithParameters(
          {},
          {
            confirmationCallback: () => {
              if (!doneCalled){
                doneCalled = true
                done()
              }
            },
          }
        )
      })()
    })

    it('should receive a transaction hash callback', (done) => {
      /* need to double wrap because of mocha doesn't support async function and done callback at the same time
       * https://github.com/mochajs/mocha/issues/2407
       */
      (async () => {
        await callAddClaimsWithParameters(
          {},
          {
            transactionHashCallback: () => {
              done()
            },
          }
        )
      })()
    })

    it('should receive a transaction receipt', async () => {
      const { transactionReceipt } = await callAddClaimsWithParameters(
        {},
        {}
      )

      expect(transactionReceipt.blockNumber).to.equal(0)
    })

    it('should receive a confirmation callback using fallback functionality', (done) => {
      /* need to double wrap because of mocha doesn't support async function and done callback at the same time
       * https://github.com/mochajs/mocha/issues/2407
       */
      (async () => {
        let doneCalled = false
        await callAddClaimsWithParameters(
          {
            emitReceipt: false,
            emitConfirmation: false
          },
          {
            confirmationCallback: () => {
              if (!doneCalled){
                doneCalled = true
                done()
              }
            },
          }
        )
      })()
    })

    it('should receive a transaction hash callback using fallback functionality', (done) => {
      /* need to double wrap because of mocha doesn't support async function and done callback at the same time
       * https://github.com/mochajs/mocha/issues/2407
       */
      (async () => {
        await callAddClaimsWithParameters(
          {
            emitReceipt: false,
            emitConfirmation: false
          },
          {
            transactionHashCallback: () => {
              done()
            },
          }
        )
      })()
    })

    it('should receive a transaction receipt using fallback functionality', async () => {
      const { transactionReceipt } = await callAddClaimsWithParameters(
        {
          emitReceipt: false,
          emitConfirmation: false
        },
        {}
      )

      expect(transactionReceipt.blockNumber).to.equal(0)
    })

  })
})
