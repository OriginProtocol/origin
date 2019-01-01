import chai from 'chai'
import chaiString from 'chai-string'
import chaiAsPromised from 'chai-as-promised'
import Web3 from 'web3'

import Users from '../src/resources/users'
import { Attestations } from '../src/resources/attestations'
import AttestationObject from '../src/models/attestation'
import ContractService from '../src/services/contract-service'
import IpfsService from '../src/services/ipfs-service'
import { validateUser } from './helpers/schema-validation-helper'

chai.use(chaiAsPromised)
chai.use(chaiString)
const expect = chai.expect


describe('User Resource v01', function() {
  this.timeout(10000) // default is 2000
  let users
  let phoneAttestation

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
    const attestations = new Attestations({ contractService })
    users = new Users({
      contractService,
      ipfsService,
      blockEpoch: await web3.eth.getBlockNumber()
    })

    const identityAddress = await attestations.getIdentityAddress(this.accounts[0])
    this.identityAddress = identityAddress

    phoneAttestation = {
      schemaId: "https://schema.originprotocol.com/attestation_1.0.0.json",
      data: {
        issuer: {
          name: "Origin Protocol",
          url: "https://www.originprotocol.com"
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
            siteName: "airbnb.com"
          }
        }
      },
      signature: "0x123"
    }
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

    it('should reflect the current state of the user', async () => {
      // Set the user's profile.
      await users.set({
        profile: {
          schemaId: 'https://schema.originprotocol.com/profile_2.0.0.json',
          firstName: 'Baby',
          lastName: 'Groot',
          ethAddress: this.userAddress
        },
      })
      let user = await users.get(this.userAddress)
      validateUser(user)

      expect(user.attestations).to.be.an('array')
      expect(user.attestations).to.be.empty

      expect(user).to.have.property('address', this.userAddress)
      expect(user).to.have.property('identityAddress', this.identityAddress)

      expect(user.profile.firstName).to.equal('Baby')
      expect(user.profile.lastName).to.equal('Groot')
      expect(user.profile.ethAddress).to.equal(this.userAddress)


      // Update the user's profile.
      const avatar = 'data:image/jpeg;base64,/OxEs0sALySAAJvQAHvJ/cnpmxLAZagGx174/9k='
      await users.set({
        profile: {
          schemaId: 'https://schema.originprotocol.com/profile_2.0.0.json',
          firstName: 'Daddy',
          lastName: 'Groot',
          ethAddress: this.userAddress,
          description: 'Grown up',
          avatar
        },
        attestations: [phoneAttestation]
      })
      user = await users.get()
      validateUser(user)

      expect(user.attestations).to.have.lengthOf(1)
      //expect(user.attestations).to.deep.equal([phoneAttestation])
      //expect(user.attestations[0].topic).to.equal(10)
      //expect(user.attestations[0].service).to.equal('phone')

      expect(user.profile.firstName).to.equal('Daddy')
      expect(user.profile.lastName).to.equal('Groot')
      expect(user.profile.ethAddress).to.equal(this.userAddress)

      expect(user.profile).to.have.property('description').that.is.a('string')
      expect(user.profile.description).to.equal('Grown up')
      expect(user.profile.avatar).to.equal(avatar)
    })
  })

})
