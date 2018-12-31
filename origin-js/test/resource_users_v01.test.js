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

const issuerPrivatekey =
  '0000000000000000000000000000000000000000000000000000000000000001'

const generateAttestation = async ({
                                     identityAddress,
                                     web3,
                                     topic,
                                     data,
                                     ipfsHash
                                   }) => {
  data = Web3.utils.soliditySha3(data)
  const msg = Web3.utils.soliditySha3(identityAddress, topic, data)
  const signing = web3.eth.accounts.sign(msg, issuerPrivatekey)
  const signature = signing.signature
  return new AttestationObject({ topic, data, signature, ipfsHash })
}

const invalidAttestation = new AttestationObject({
  topic: 123,
  data: Web3.utils.sha3('gibberish'),
  signature:
    '0x4e8feba65cbd88fc246013da8dfb478e880518594d86349f54af9c8d5e2eac2b223222c4c6b93f18bd54fc88f4342f1b02a8ea764a411fc02823a3420574375c1c'
})

const invalidSignatureAttestation = new AttestationObject({
  topic: 5,
  data: Web3.utils.sha3('airbnb verified'),
  signature:
    '0xabcdeba65cbd88fc246013da8dfb478e880518594d86349f54af9c8d5e2eac2b223222c4c6b93f18bd54fc88f4342f1b02a8ea764a411fc02823a3420574375c1a'
})

describe('User Resource v01', function() {
  this.timeout(10000) // default is 2000
  let users
  let phoneAttestation
  let emailAttestation
  let facebookAttestation
  let twitterAttestation
  let airbnbAttestation

  beforeEach(async () => {
    const provider = new Web3.providers.HttpProvider('http://localhost:8545')
    const web3 = new Web3(provider)
    const accounts = await web3.eth.getAccounts()
    this.userAddress = accounts[0]
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

    const identityAddress = await attestations.getIdentityAddress(accounts[0])
    this.identityAddress = identityAddress

    phoneAttestation = await generateAttestation({
      identityAddress,
      web3,
      topic: 10,
      data: 'phone verified'
    })
    emailAttestation = await generateAttestation({
      identityAddress,
      web3,
      topic: 11,
      data: 'email verified'
    })
    facebookAttestation = await generateAttestation({
      identityAddress,
      web3,
      topic: 3,
      data: 'facebook verified'
    })
    twitterAttestation = await generateAttestation({
      identityAddress,
      web3,
      topic: 4,
      ipfsHash: 'QmR8ui1hXztBJ8CGXxXmN5btZXMPZzjgCe9NpeatVdCB8q',
      data: '0x7b6d4739164e722b313c3f00dd61ab3e79781e919d7aaeb651c1277d591b6bc2'
    })
    airbnbAttestation = await generateAttestation({
      identityAddress,
      web3,
      topic: 5,
      ipfsHash: 'QmVA6KZSsx8hutLLM4T8RsU13LA5RvdE57BnF5kyG9CEnX',
      data: '0x450f554220fe1c17db122f2ea8c493e93186143aab8e1b1100f1c535113a7b51'
    })
  })

  describe('set', () => {
    it('should be able to deploy new identity v01', async () => {
      await users.set({
        profile: {
          firstName: 'Wonder',
          lastName: 'Woman',
          ethAddress: '0xf17f52151EbEF6C7334FAD080c5704D77216b732'
        }
      })
      const user = await users.get()
      console.log("USERS.get() = ", JSON.stringify(user))
      validateUser(user)

      expect(user.attestations).to.be.empty
      expect(user.profile.firstName).to.equal('Wonder')
      expect(user.profile.lastName).to.equal('Woman')
      expect(user.profile.ethAddress).to.equal('0xf17f52151EbEF6C7334FAD080c5704D77216b732')
    })
  })

  describe('get', () => {
    it('should return empty User object if no profile', async () => {
      const user = await users.get('0x0d1d4e623d10f9fba5db95830f7d3839406c6af2')
      expect(user).to.have.property('address', '0x0d1d4e623d10f9fba5db95830f7d3839406c6af2')
      expect(user).to.have.property('identityAddress', undefined)
      expect(user).to.have.property('profile', undefined)
      expect(user).to.have.property('attestations', undefined)
    })

    it('should reflect the current state of the user', async () => {
      // Set the user's profile.
      await users.set({
        profile: {
          firstName: 'Baby',
          lastName: 'Groot',
          ethAddress: '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
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
      expect(user.profile.ethAddress).to.equal('0x627306090abaB3A6e1400e9345bC60c78a8BEf57')


      // Update the user's profile.
      const avatar = 'data:image/jpeg;base64,/OxEs0sALySAAJvQAHvJ/cnpmxLAZagGx174/9k='
      await users.set({
        profile: {
          firstName: 'Daddy',
          lastName: 'Groot',
          ethAddress: '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef',
          description: 'Grown up',
          avatar
        },
        attestations: [phoneAttestation]
      })
      user = await users.get()
      validateUser(user)

      expect(user.attestations).to.have.lengthOf(1)
      expect(user.attestations).to.deep.equal([phoneAttestation])
      expect(user.attestations[0].topic).to.equal(10)
      expect(user.attestations[0].service).to.equal('phone')

      expect(user.profile.firstName).to.equal('Daddy')
      expect(user.profile.lastName).to.equal('Groot')
      expect(user.profile.ethAddress).to.equal('0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef')

      expect(user.profile).to.have.property('description').that.is.a('string')
      expect(user.profile.description).to.equal('Grown up')
      expect(user.profile.avatar).to.equal(avatar)
    })
  })

})
