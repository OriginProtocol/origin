import chai from 'chai'
import chaiString from 'chai-string'
import chaiAsPromised from 'chai-as-promised'
import stringify from 'json-stable-stringify'
import Web3 from 'web3'

import Users from '../src/resources/users'
import AttestationObject from '../src/models/attestation'
import ContractService from '../src/services/contract-service'
import IpfsService from '../src/services/ipfs-service'
import { validateUser } from './helpers/schema-validation-helper'

chai.use(chaiAsPromised)
chai.use(chaiString)
const expect = chai.expect

const issuerSigningKey =
  '0x1fc2b755568ce8402e422f8fd0da54d384f42962c8f925116964f39245d429e0'
const issuerAddress = '0x99C03fBb0C995ff1160133A8bd210D0E77bCD101'

const emailAttestationData = {
  schemaId: "https://schema.originprotocol.com/attestation_1.0.0.json",
  data: {
    issuer: {
      name: "Origin Protocol",
      url: "https://www.originprotocol.com",
      ethAddress: issuerAddress
    },
    issueDate: "Jan 1st 2019",
    attestation: {
      verificationMethod: {
        email: true
      },
      email: {
        verified: true,
      }
    }
  },
  signature: {
    bytes: null, // Populate by calling signAttestation()
    version: '1.0.0'
  }
}

const twitterAttestationData = {
  schemaId: "https://schema.originprotocol.com/attestation_1.0.0.json",
  data: {
    issuer: {
      name: "Origin Protocol",
      url: "https://www.originprotocol.com",
      ethAddress: issuerAddress
    },
    issueDate: "Jan 1st 2019",
    attestation: {
      verificationMethod: {
        oAuth: true
      },
      site: {
        userId: {
          raw: "123"
        },
        siteName: "twitter.com"
      }
    }
  },
  signature: {
    bytes: null, // Populate by calling signAttestation()
    version: '1.0.0'
  }
}

/**
 * Helper function to sign an attestation for testing purposes.
 * This is identical to the implementation in the Origin attestation server. See
 * https://github.com/OriginProtocol/origin/blob/master/origin-bridge/util/attestations.py
 * @param {object} web3
 * @param {string} account - User's ETH address.
 * @param {object} data - Attestation data to sign.
 * @return {string}
 */
function signAttestation(web3, account, data) {
  const normalizedData = stringify(data)
  const hashedData = Web3.utils.sha3(normalizedData)
  const msg = Web3.utils.soliditySha3(account, hashedData)
  const signing = web3.eth.accounts.sign(msg, issuerSigningKey)
  return signing.signature
}

describe('User Resource v01', function() {
  this.timeout(10000) // default is 2000
  let users
  let emailAttestation, twitterAttestation

  beforeEach(async () => {
    const provider = new Web3.providers.HttpProvider('http://localhost:8545')
    const web3 = new Web3(provider)
    this.accounts = await web3.eth.getAccounts()
    this.userAddress = this.accounts[0]
    const contractService = new ContractService({ web3 })
    await contractService.deployed(contractService.contracts.IdentityEvents)
    const ipfsService = new IpfsService({
      ipfsDomain: '127.0.0.1',
      ipfsApiPort: '5002',
      ipfsGatewayPort: '8080',
      ipfsGatewayProtocol: 'http'
    })
    users = new Users({
      contractService,
      ipfsService,
      blockEpoch: await web3.eth.getBlockNumber(),
      attestationAccount: issuerAddress
    })

    twitterAttestationData.signature.bytes = signAttestation(
      web3, this.userAddress, twitterAttestationData.data)
    twitterAttestation = AttestationObject.create(twitterAttestationData)

    emailAttestationData.signature.bytes = signAttestation(
      web3, this.userAddress, emailAttestationData.data)
    emailAttestation = AttestationObject.create(emailAttestationData)
  })

  describe('set', () => {
    it('should be able to deploy new identity v01', async () => {
      await users.set({
        profile: {
          schemaId: 'https://schema.originprotocol.com/profile_2.0.0.json',
          firstName: 'Wonder',
          lastName: 'Woman',
          ethAddress: this.userAddress
        }
      })
      const user = await users.get()
      validateUser(user)

      expect(user.attestations).to.be.empty
      expect(user.profile.firstName).to.equal('Wonder')
      expect(user.profile.lastName).to.equal('Woman')
      expect(user.profile.ethAddress).to.equal(this.userAddress)
    })
  })

  describe('get', () => {
    it('should return empty User object if no profile', async () => {
      const user = await users.get(this.accounts[1])
      expect(user).to.have.property('address', this.accounts[1])
      expect(user).to.have.property('identityAddress', undefined)
      expect(user).to.have.property('profile', undefined)
      expect(user).to.have.property('attestations', undefined)
    })
  })

  describe('set', () => {
    it('set profile', async () => {
      // Set the user's profile.
      await users.set({
        profile: {
          schemaId: 'https://schema.originprotocol.com/profile_2.0.0.json',
          firstName: 'Baby',
          lastName: 'Groot',
          ethAddress: this.userAddress
        },
      })
      const user = await users.get(this.userAddress)
      validateUser(user)

      expect(user.attestations).to.be.an('array')
      expect(user.attestations).to.be.empty

      expect(user).to.have.property('address', this.userAddress)
      expect(user).to.have.property('identityAddress', this.userAddress)

      expect(user.profile.firstName).to.equal('Baby')
      expect(user.profile.lastName).to.equal('Groot')
      expect(user.profile.ethAddress).to.equal(this.userAddress)
    })

    it('add 1 attestation', async () => {
      const avatar = 'data:image/jpeg;base64,/OxEs0sALySAAJvQAHvJ/cnpmxLAZagGx174/9k='
      const profile = {
        firstName: 'Daddy',
        lastName: 'Groot',
        description: 'Grown up',
        avatar
      }
      await users.set({
        profile,
        attestations: [twitterAttestation]
      })
      const user = await users.get()
      validateUser(user)

      expect(user.profile.schemaId).to.equal('https://schema.originprotocol.com/profile_2.0.0.json')
      expect(user.profile.ethAddress).to.equal(this.userAddress)
      expect(user.profile.firstName).to.equal('Daddy')
      expect(user.profile.lastName).to.equal('Groot')
      expect(user.profile.description).to.equal('Grown up')
      expect(user.profile.avatar).to.equal(avatar)

      expect(user.attestations).to.have.lengthOf(1)
      expect(user.attestations[0].topic).to.equal(4)
      expect(user.attestations[0].service).to.equal('twitter')
      expect(user.attestations[0].data).to.deep.equal(twitterAttestationData.data)
      expect(user.attestations[0].signature).to.deep.equal(twitterAttestationData.signature)
    })

    it('add another attestations', async () => {
      const avatar = 'data:image/jpeg;base64,/OxEs0sALySAAJvQAHvJ/cnpmxLAZagGx174/9k='
      const profile = {
        firstName: 'Mommy',
        lastName: 'Groot',
        description: 'Mama',
        avatar
      }
      await users.set({
        profile,
        attestations: [emailAttestation]
      })
      const user = await users.get()
      validateUser(user)

      expect(user.profile.schemaId).to.equal('https://schema.originprotocol.com/profile_2.0.0.json')
      expect(user.profile.ethAddress).to.equal(this.userAddress)
      expect(user.profile.firstName).to.equal('Mommy')
      expect(user.profile.lastName).to.equal('Groot')
      expect(user.profile.description).to.equal('Mama')
      expect(user.profile.avatar).to.equal(avatar)

      expect(user.attestations).to.have.lengthOf(2)
      expect(user.attestations[1].topic).to.equal(11)
      expect(user.attestations[1].service).to.equal('email')
      expect(user.attestations[1].data).to.deep.equal(emailAttestationData.data)
      expect(user.attestations[1].signature).to.deep.equal(emailAttestationData.signature)
    })

    it('duplicate attestation should not get added', async () => {
      const profile = {
        firstName: 'Mommy',
        lastName: 'Groot'
      }
      await users.set({
        profile,
        attestations: [emailAttestation]
      })
      const user = await users.get()
      validateUser(user)

      expect(user.attestations).to.have.lengthOf(2)
    })

  })

})
