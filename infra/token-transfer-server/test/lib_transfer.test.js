const BigNumber = require('bignumber.js')
const chai = require('chai')
chai.use(require('chai-as-promised'))
chai.use(require('chai-bignumber')(BigNumber))
chai.use(require('chai-moment'))
const expect = chai.expect

const Token = require('@origin/token/src/token')

const { enqueueTransfer, executeTransfer } = require('../src/lib/transfer')
const { Event, Grant, Transfer, User, sequelize } = require('../src/models')
const enums = require('../src/enums')


// Mock for the Token class.
class TokenMock extends Token {
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
    return 'testTxHash'
  }

  async waitForTxConfirmation(txHash) {
    return { status: 'confirmed', receipt: { txHash, blockNumber: 123, status: true } }
  }
}

describe('Transfer token lib', () => {
  const email = 'cryptopup@originprotocol.com'
  const grantId = 1
  const userId = 1
  const ip = '127.0.0.1'
  const networkId = 999
  const fromAddress = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
  const toAddress = '0xf17f52151ebef6c7334fad080c5704d77216b732'
  const tokenMock = new TokenMock(networkId, fromAddress, toAddress, 1000)
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

  it('Should enqueue a transfer', async () => {
    const amount = 1000
    const transferId =  await enqueueTransfer(user.id, grant.id, toAddress, amount, ip)

    // Check a transfer row was created and populated as expected.
    const transfer = await Transfer.findOne({ where: { id: transferId } })
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

  it('Should execute a transfer', async () => {
    // Enqueue and execute a transfer.
    const amount = 1000
    const transferId =  await enqueueTransfer(user.id, grant.id, toAddress, amount, ip)
    const transfer = await Transfer.findOne({ where: { id: transferId } })
    const { txHash, txStatus } = await executeTransfer(transfer, { networkId, tokenMock })
    expect(txStatus).to.equal('confirmed')
    expect(txHash).to.equal('testTxHash')

    // Check the transfer row was updated as expected.
    transfer.reload()
    expect(transfer.status).to.equal(enums.TransferStatuses.Success)
  })

  it('should reject a request with a bad grant ID', async () => {
    await expect(enqueueTransfer(userId, grantId+1, toAddress, 1, ip)).to.be.rejectedWith('Could not find specified grant id')
  })

  it('should reject a request with a bad user ID', async () => {
    await expect(enqueueTransfer(userId+1, grantId, toAddress, 1, ip)).to.be.rejectedWith('No user found with id')
  })
})
