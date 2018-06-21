import { Attestations } from '../src/resources/attestations.js'
import ContractService from '../src/services/contract-service'
import chai, { expect } from 'chai'
import Web3 from 'web3'
import fetchMock from 'fetch-mock'
chai.use(require('chai-string'))

const sampleWallet = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
const sampleAttestation = {
  'claim-type': 1,
  data: 'some data',
  signature: '0x1a2b3c'
}

const expectPostParams = (requestBody, params) => {
  params.forEach(param => {
    expect(requestBody[param], `Param ${param} should be in the request`).to
      .exist
  })
}

const expectGetParams = (requestUrl, params) => {
  params.forEach(param => {
    expect (requestUrl, `Param ${param}  should be present in request url`).to
      .match(new RegExp('.*[\\?&]{1}' + param + '=.*'))
  })
}

const expectAttestation = result => {
  expect(result.signature).to.equal(sampleAttestation.signature)
  expect(result.data).to.equal(Web3.utils.soliditySha3(sampleAttestation.data))
  expect(result.claimType).to.equal(sampleAttestation['claim-type'])
}

const setup = () => {
  const provider = new Web3.providers.HttpProvider('http://localhost:8545')
  const web3 = new Web3(provider)
  const contractService = new ContractService({ web3 })
  return new Attestations({ contractService })
}

const setupWithServer = ({
  expectedMethod,
  expectedPath,
  expectedParams,
  responseStub
}) => {
  const provider = new Web3.providers.HttpProvider('http://localhost:8545')
  const web3 = new Web3(provider)
  const contractService = new ContractService({ web3 })
  const serverUrl = 'http://fake.url/api/attestations' // fake url
  const fetch = fetchMock.sandbox().mock(
    (requestUrl, opts) => {
      expect(opts.method).to.equal(expectedMethod)
      const serverPath = serverUrl + '/' + expectedPath

      if (expectedMethod.toLowerCase() == 'post') {
        expect(requestUrl).to.equal(serverPath)

        if (expectedParams) {
          const requestBody = JSON.parse(opts.body)
          expectPostParams(requestBody, expectedParams)
        }
      } else if (expectedMethod.toLowerCase() == 'get') {
        expect(requestUrl).to.startsWith(serverPath)

        if (expectedParams) {
          expectGetParams(requestUrl, expectedParams)
        }
      }

      return true
    },
    { body: JSON.stringify(responseStub) }
  )
  return new Attestations({ fetch, serverUrl, contractService })
}

describe('Attestation Resource', function() {
  this.timeout(5000) // default is 2000

  describe('getIdentityAddress', () => {
    it('should predict identity address from wallet', async () => {
      const attestations = setup()
      const wallet = await attestations.contractService.currentAccount()
      const identityAddress = await attestations.getIdentityAddress(wallet)
      expect(identityAddress).to.be.a('string')
    })
  })

  describe('phoneGenerateCode', () => {
    it('should process the request', async () => {
      const attestations = setupWithServer({
        expectedMethod: 'POST',
        expectedPath: 'phone/generate-code',
        responseStub: {}
      })
      const response = await attestations.phoneGenerateCode({
        phone: '555-555-5555'
      })
      expect(response).to.be.an('object')
    })
  })

  describe('phoneVerify', () => {
    it('should process the request', async () => {
      const attestations = setupWithServer({
        expectedMethod: 'POST',
        expectedPath: 'phone/verify',
        expectedParams: ['identity', 'phone', 'code'],
        responseStub: sampleAttestation
      })
      const response = await attestations.phoneVerify({
        wallet: sampleWallet,
        phone: '555-555-5555',
        code: '12345'
      })
      expectAttestation(response)
    })
  })

  describe('emailGenerateCode', () => {
    it('should process the request', async () => {
      const attestations = setupWithServer({
        expectedMethod: 'POST',
        expectedPath: 'email/generate-code',
        expectedParams: ['email'],
        responseStub: {}
      })
      const response = await attestations.emailGenerateCode({
        email: 'asdf@asdf.asdf'
      })
      expect(response).to.be.an('object')
    })
  })

  describe('emailVerify', () => {
    it('should process the request', async () => {
      const attestations = setupWithServer({
        expectedMethod: 'POST',
        expectedPath: 'email/verify',
        expectedParams: ['identity', 'email', 'code'],
        responseStub: sampleAttestation
      })
      const response = await attestations.emailVerify({
        wallet: sampleWallet,
        email: 'asdf@asdf.asdf',
        code: '12345'
      })
      expectAttestation(response)
    })
  })

  describe('facebookAuthUrl', () => {
    it('should process the request', async () => {
      const attestations = setupWithServer({
        expectedMethod: 'GET',
        expectedPath: 'facebook/auth-url',
        responseStub: { url: 'foo.bar' }
      })
      const response = await attestations.facebookAuthUrl()
      expect(response).to.equal('foo.bar')
    })
  })

  describe('facebookVerify', () => {
    it('should process the request', async () => {
      const attestations = setupWithServer({
        expectedMethod: 'POST',
        expectedPath: 'facebook/verify',
        expectedParams: ['identity', 'code'],
        responseStub: sampleAttestation
      })
      const response = await attestations.facebookVerify({
        wallet: sampleWallet,
        code: '12345'
      })
      expectAttestation(response)
    })
  })

  describe('twitterAuthUrl', () => {
    it('should process the request', async () => {
      const attestations = setupWithServer({
        expectedMethod: 'GET',
        expectedPath: 'twitter/auth-url',
        responseStub: { url: 'foo.bar' }
      })
      const response = await attestations.twitterAuthUrl()
      expect(response).to.equal('foo.bar')
    })
  })

  describe('twitterVerify', () => {
    it('should process the request', async () => {
      const attestations = setupWithServer({
        expectedMethod: 'POST',
        expectedPath: 'twitter/verify',
        expectedParams: ['identity', 'oauth-verifier'],
        responseStub: sampleAttestation
      })
      const response = await attestations.twitterVerify({
        wallet: sampleWallet,
        code: 'foo.bar'
      })
      expectAttestation(response)
    })
  })

  describe('airbnbGenerateCode', () => {
    it('should process the request', async () => {
      const attestations = setupWithServer({
        expectedMethod: 'GET',
        expectedPath: 'airbnb/generate-code',
        expectedParams: ['identity', 'airbnbUserId'],
        responseStub: {'code': '0x5tegfyty'}
      })
      const response = await attestations.airbnbGenerateCode({
        wallet: '0xB529f14AA8096f943177c09Ca294Ad66d2E08b1f',
        airbnbUserId: '2049937'
      })

      expect(response).to.eql({'code': '0x5tegfyty'})
    })
  })

  describe('airbnbVerify', () => {
    it('should process the request', async () => {
      const attestations = setupWithServer({
        expectedMethod: 'POST',
        expectedPath: 'airbnb/verify',
        expectedParams: ['identity', 'airbnbUserId'],
        responseStub: sampleAttestation
      })
      const response = await attestations.airbnbVerify({
        wallet: '0xB529f14AA8096f943177c09Ca294Ad66d2E08b1f',
        airbnbUserId: '2049937'
      })
      expectAttestation(response)
    })
  })
})
