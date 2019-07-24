const BigNumber = require('bignumber.js')
const chai = require('chai')
chai.use(require('chai-as-promised'))
chai.use(require('chai-bignumber')(BigNumber))
chai.use(require('chai-moment'))
const expect = chai.expect

const Token = require('@origin/token/src/token')

const { GRANT_TRANSFER } = require('../src/constants/events')
const { enqueueTransfer, executeTransfer } = require('../src/lib/transfer')
const { Event, Grant, Transfer, User, sequelize } = require('../src/models')

class TokenForTests extends Token {
  constructor(networkId, fromAddress, toAddress, valueTokenUnit) {
    super(networkId, null)
    this.networkId = networkId
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.valueNaturalUnit = this.toNaturalUnit(valueTokenUnit)
  }

  async defaultAccount() {
    return this.fromAddress
  }

  async credit(address, value) {
    expect(address).to.equal(this.toAddress)
    expect(value).to.bignumber.equal(this.valueNaturalUnit)
  }
}

describe('Transfer token lib', () => {
  const email = 'cryptopup@originprotocol.com'
  const grantId = 1
  const userId = 1
  const ip = '127.0.0.1'
  const networkId = 999
  const fromAddress = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
  const toAddress = '0xf17f52151EbEF6C7334FAD080c5704D77216b732'
  let grant, user

  beforeEach(async () => {
    // Wipe database before each test.
    expect(process.env.NODE_ENV).to.equal('test')
    await sequelize.sync({ force: true })
    const grants = await Grant.findAll()
    expect(grants.length).to.equal(0)
    const events = await Event.findAll()
    expect(events.length).to.equal(0)

    grant = new Grant({
      email: email,
      grantedAt: '2014-01-01 00:00:00',
      amount: 1000,
      totalMonths: 48,
      cliffMonths: 12,
      vested: 1000,
      transferred: 0
    })
    await grant.save()
    await grant.reload()
    expect(grant.id).to.equal(grantId)
    
    user = new User({
      id: userId,
      email: 'foo@bar.com'
    })
    await user.save()
    await user.reload()
    expect(user.id).to.equal(userId)
  })

  it('Should enqueue a request', async () => {
    const amount = 1000
    const transferId =  await enqueueTransfer(user.id, grant.id, toAddress, amount, ip)

    // Check a transfer row was created and populated as expected.
    const transfer = await Transfer.findOne({ where: { id: transferId }})
    expect(transfer).to.be.an('object')
    expect(transfer.userId).to.equal(user.id)
    expect(transfer.grantId).to.equal(grant.id)
    expect(transfer.toAddress).to.equal(toAddress.toLowerCase())
    expect(transfer.fromAddress).to.be.null
    expect(transfer.amount).to.equal(amount.toString())
    expect(transfer.currency).to.equal('OGN')
    expect(transfer.txHash).to.be.null
    expect(transfer.data).to.be.null
  })


  /*
  it('should transfer an integer amount of tokens', async () => {
    const amount = 1000
    const tokenForTests = new TokenForTests(networkId, fromAddress, toAddress, amount)
    await transferTokens({
      grantId,
      email,
      ip,
      networkId,
      address: toAddress,
      amount,
      tokenForTests
    })

    await grant.reload()
    expect(grant.transferred).to.equal(amount)

    const events = await Event.findAll()
    expect(events.length).to.equal(1)
    expect(events[0].id).to.equal(1)
    expect(events[0].email).to.equal(email)
    expect(events[0].ip).to.equal(ip)
    expect(events[0].action).to.equal(GRANT_TRANSFER)
    const data = JSON.parse(events[0].data)
    expect(data.amount).to.equal(amount)
    expect(data.from).to.equal(fromAddress)
    expect(data.to).to.equal(toAddress)
  })

  it('should transfer fractional tokens', async () => {
    const amount = 9.7
    const tokenForTests = new TokenForTests(networkId, fromAddress, toAddress, amount)
    await transferTokens({
      grantId,
      email,
      ip,
      networkId,
      address: toAddress,
      amount,
      tokenForTests
    })

    await grant.reload()
    expect(grant.transferred).to.equal(amount)

    const events = await Event.findAll()
    expect(events.length).to.equal(1)
    expect(events[0].id).to.equal(1)
    expect(events[0].email).to.equal(email)
    expect(events[0].ip).to.equal(ip)
    expect(events[0].action).to.equal(GRANT_TRANSFER)
    const data = JSON.parse(events[0].data)
    expect(data.amount).to.equal(amount)
    expect(data.from).to.equal(fromAddress)
    expect(data.to).to.equal(toAddress)
  })

  it('should throw an error when email and grant do not match', async () => {
    const amount = 1
    const tokenForTests = new TokenForTests(networkId, fromAddress, toAddress, amount)
    await expect(transferTokens({
      grantId,
      email: email + 'bad email',
      ip,
      networkId,
      address: toAddress,
      amount,
      tokenForTests
    })).to.be.rejectedWith('Could not find specified grant')
  })

  it('should throw an error with a bad grant ID', async () => {
    const amount = 1
    const tokenForTests = new TokenForTests(networkId, fromAddress, toAddress, amount)
    await expect(transferTokens({
      grantId: grantId + 1,
      email,
      ip,
      networkId,
      address: toAddress,
      amount,
      tokenForTests
    })).to.be.rejectedWith('Could not find specified grant')
  })

  it('should throw an error when transferring too many tokens', async () => {
    const badAmount = 1001
    const tokenForTests = new TokenForTests(networkId, fromAddress, toAddress, badAmount)
    await expect(transferTokens({
      grantId,
      email,
      ip,
      networkId,
      address: toAddress,
      amount: badAmount,
      tokenForTests
    })).to.be.rejectedWith('Amount of 1001 OGN exceeds the 1000 OGN available for the grant')
  })

   */
})
