import chai from 'chai'
import chaiString from 'chai-string'
import chaiAsPromised from 'chai-as-promised'
import { encode as rlpEncode } from 'rlp'
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

const predictIdentityAddress = async (web3, wallet) => {
  const nonce = await new Promise(resolve => {
    web3.eth.getTransactionCount(wallet, (err, count) => {
      resolve(count)
    })
  })
  const address =
    '0x' + Web3.utils.sha3(rlpEncode([wallet, nonce])).substring(26, 66)
  return Web3.utils.toChecksumAddress(address)
}

const getIdentityAddress = async (contractService, adapter, wallet) => {
  const currentAccount = await contractService.currentAccount()
  wallet = wallet || currentAccount
  const identityAddress = await adapter.identityAddress(wallet)
  if (identityAddress) {
    return Web3.utils.toChecksumAddress(identityAddress)
  } else {
    return predictIdentityAddress(contractService.web3, wallet)
  }
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

describe('User Resource v00', function() {
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
    await contractService.deployed(contractService.contracts.OriginIdentity)
    const ipfsService = new IpfsService({
      ipfsDomain: '127.0.0.1',
      ipfsApiPort: '5002',
      ipfsGatewayPort: '8080',
      ipfsGatewayProtocol: 'http'
    })
    users = new Users({
      contractService,
      ipfsService,
      blockEpoch: await web3.eth.getBlockNumber()
    })

    // Force resolver to use V00 contract.
    users.resolver.currentAdapter = users.resolver.adapters['000']

    // clear user before each test because blockchain persists between tests
    // sort of a hack to force clean state at beginning of each test
    const userRegistry = await contractService.deployed(
      contractService.contracts.V00_UserRegistry
    )
    await userRegistry.methods.clearUser().send({ from: this.userAddress })

    const identityAddress = await getIdentityAddress(
      contractService, users.resolver.currentAdapter, accounts[0])
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
    it('should be able to deploy new identity', async () => {
      await users.set({
        profile: { firstName: 'Wonder', lastName: 'Woman' }
      })
      const user = await users.get()
      validateUser(user)

      expect(user.attestations).to.be.empty
      expect(user.profile.firstName).to.equal('Wonder')
      expect(user.profile.lastName).to.equal('Woman')
    })

    it('should be able to update profile and claims after creation', async () => {
      await users.set({
        profile: { firstName: 'Iron', lastName: 'Man' }
      })
      let user = await users.get()
      validateUser(user)

      expect(user.attestations).to.be.empty
      expect(user.profile.firstName).to.equal('Iron')
      expect(user.profile.lastName).to.equal('Man')

      await users.set({
        profile: { firstName: 'Black', lastName: 'Panther' },
        attestations: [phoneAttestation]
      })
      user = await users.get()
      validateUser(user)

      expect(user.attestations).to.have.lengthOf(1)
      expect(user.attestations).to.deep.equal([phoneAttestation])

      expect(user.attestations[0].topic).to.equal(10)
      expect(user.attestations[0].service).to.equal('phone')
      expect(user.profile.firstName).to.equal('Black')
      expect(user.profile.lastName).to.equal('Panther')

      await users.set({
        profile: { firstName: 'Bat', lastName: 'Man' },
      })
      user = await users.get()

      expect(user.attestations).to.have.lengthOf(1)
      expect(user.profile.firstName).to.equal('Bat')
      expect(user.profile.lastName).to.equal('Man')

      await users.set({
        attestations: [phoneAttestation, emailAttestation]
      })
      user = await users.get()

      expect(user.attestations).to.have.lengthOf(2)
      expect(user.attestations).to.deep.equal([phoneAttestation, emailAttestation])
      expect(user.profile.firstName).to.equal('Bat')
      expect(user.profile.lastName).to.equal('Man')
    })

    it('should be able to deploy new identity with 2 presigned claims', async () => {
      // This is actually 2 claims because profile info is 1 claim
      await users.set({
        profile: { firstName: 'Black', lastName: 'Widow' },
        attestations: [phoneAttestation]
      })
      const user = await users.get()
      validateUser(user)

      expect(user.attestations).to.have.lengthOf(1)
      expect(user.attestations).to.deep.equal([phoneAttestation])
      expect(user.profile.firstName).to.equal('Black')
      expect(user.profile.lastName).to.equal('Widow')
    })

    it('should be able to deploy new identity with 3 presigned claims', async () => {
      await users.set({
        profile: { firstName: 'Black', lastName: 'Widow' },
        attestations: [phoneAttestation, emailAttestation]
      })
      const user = await users.get()

      expect(user.attestations.length).to.equal(2)
      expect(user.attestations).to.deep.equal([phoneAttestation, emailAttestation])
      expect(user.profile.firstName).to.equal('Black')
      expect(user.profile.lastName).to.equal('Widow')
    })

    it('should be able to deploy new identity with 4 presigned claims', async () => {
      await users.set({
        profile: { firstName: 'Black', lastName: 'Widow' },
        attestations: [phoneAttestation, emailAttestation, facebookAttestation]
      })
      const user = await users.get()

      expect(user.attestations.length).to.equal(3)
      expect(user.attestations).to.deep.equal([
        phoneAttestation,
        emailAttestation,
        facebookAttestation
      ])

      expect(user.profile.firstName).to.equal('Black')
      expect(user.profile.lastName).to.equal('Widow')
    })

    it('should be able to deploy new identity with 6 presigned claims', async () => {
      await users.set({
        profile: { firstName: 'Black', lastName: 'Widow' },
        attestations: [
          phoneAttestation,
          emailAttestation,
          facebookAttestation,
          twitterAttestation,
          airbnbAttestation
        ]
      })
      const user = await users.get()

      expect(user.attestations.length).to.equal(5)
      expect(user.attestations).to.deep.equal([
        phoneAttestation,
        emailAttestation,
        facebookAttestation,
        twitterAttestation,
        airbnbAttestation
      ])

      expect(user.profile.firstName).to.equal('Black')
      expect(user.profile.lastName).to.equal('Widow')
    })

    it('should ignore invalid claims', async () => {
      await users.set({
        profile: { firstName: 'Dead', lastName: 'Pool' },
        attestations: [phoneAttestation, emailAttestation, invalidAttestation]
      })
      const user = await users.get()
      validateUser(user)

      expect(user.attestations.length).to.equal(2)
      expect(user.attestations).to.not.include(invalidAttestation)
      expect(user.attestations).to.deep.equal([phoneAttestation, emailAttestation])
      expect(user.profile.firstName).to.equal('Dead')
      expect(user.profile.lastName).to.equal('Pool')
    })

    it('should ignore claims with invalid signatures', async () => {
      await users.set({
        profile: { firstName: 'Dead', lastName: 'Pool' },
        attestations: [phoneAttestation, emailAttestation, invalidSignatureAttestation]
      })
      const user = await users.get()
      validateUser(user)

      expect(user.attestations.length).to.equal(2)
      expect(user.attestations).to.not.include(invalidSignatureAttestation)
      expect(user.attestations).to.deep.equal([phoneAttestation, emailAttestation])
      expect(user.profile.firstName).to.equal('Dead')
      expect(user.profile.lastName).to.equal('Pool')
    })

    it('should fail setting an invalid profile', () => {
      const badProfile = { profile: { bad: 'profile' } }
      const dataErrors = [
        {
          keyword: 'required',
          dataPath: '',
          schemaPath: '#/required',
          params: { missingProperty: 'firstName' },
          message: 'should have required property \'firstName\''
        },
        {
          keyword: 'required',
          dataPath: '',
          schemaPath: '#/required',
          params: { missingProperty: 'lastName' },
          message: 'should have required property \'lastName\''
        }
      ]

      return users.set(badProfile).then().catch(({ message }) => {
        expect(message).to.include('Data failed schema validation.')
        expect(message).to.include(JSON.stringify(dataErrors))
      })
    })

    it('should be able to receive transactionHash and onComplete callbacks', (done) => {
      let transactionHash
      let doneCalled = false

      users.set({
        profile: {
          firstName: 'Wonder',
          lastName: 'Woman',
        },
        options: {
          transactionHashCallback: (hash) => {
            transactionHash = hash
          },
          confirmationCallback: (confirmationCount, transactionReceipt) => {
            expect(confirmationCount).is.a('number')
            expect(transactionReceipt).is.a('object')
            // transactionHashCallback should always execute before confirmationCallback
            expect(transactionHash).to.startWith('0x')

            // prevent done being called multiple times
            if (!doneCalled){
              doneCalled = true
              done()
            }
          }
        }
      })
    })
  })

  describe('get', () => {
    it('should reflect the current state of the user', async () => {
      await users.set({
        profile: { firstName: 'Baby', lastName: 'Groot' },
      })
      let user = await users.get(this.userAddress)
      validateUser(user)

      expect(user.attestations).to.be.an('array')
      expect(user.attestations).to.be.empty

      expect(user).to.have.property('address', this.userAddress)
      expect(user).to.have.property('identityAddress', this.identityAddress)

      expect(user.profile.firstName).to.equal('Baby')
      expect(user.profile.lastName).to.equal('Groot')

      const avatar = 'data:image/jpeg;base64,/OxEs0sALySAAJvQAHvJ/cnpmxLAZagGx174/9k='

      await users.set({
        profile: {
          firstName: 'Daddy',
          lastName: 'Groot',
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
      expect(user.profile).to.have.property('description').that.is.a('string')
      expect(user.profile.description).to.equal('Grown up')
      expect(user.profile.avatar).to.equal(avatar)
    })
  })

})
