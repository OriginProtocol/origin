const BigNumber = require('bignumber.js')
const chai = require('chai')
chai.use(require('chai-as-promised'))
chai.use(require('chai-bignumber')(BigNumber))
chai.use(require('chai-moment'))
const expect = chai.expect

const { enqueueTransfer, executeTransfer } = require('../../src/lib/transfer')
const { Event, Grant, Transfer, User, sequelize } = require('../../src/models')
const enums = require('../../src/enums')

// Mock for the Token class in the @origin/token package.
class TokenMock {
  constructor(networkId, fromAddress, toAddress) {
    this.networkId = networkId
    this.fromAddress = fromAddress
    this.toAddress = toAddress
    this.decimals = 18
    this.scaling = BigNumber(10).exponentiatedBy(this.decimals)
  }

  async defaultAccount() {
    return this.fromAddress
  }

  async credit(address, value) {
    expect(address).to.equal(this.toAddress)
    expect(value.toNumber()).to.be.an('number')
    return 'testTxHash'
  }

  async waitForTxConfirmation(txHash) {
    return {
      status: 'confirmed',
      receipt: { txHash, blockNumber: 123, status: true }
    }
  }

  toNaturalUnit(value) {
    return BigNumber(value).multipliedBy(this.scaling)
  }
}

describe('Transfer token lib', () => {
  const ip = '127.0.0.1'
  const networkId = 999
  const fromAddress = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
  const toAddress = '0xf17f52151ebef6c7334fad080c5704d77216b732'
  const tokenMock = new TokenMock(networkId, fromAddress, toAddress)

  beforeEach(async () => {
    // Wipe database before each test.
    expect(process.env.NODE_ENV).to.equal('test')
    await sequelize.sync({ force: true })
    const grants = await Grant.findAll()
    expect(grants.length).to.equal(0)
    const events = await Event.findAll()
    expect(events.length).to.equal(0)

    this.user = await User.create({
      email: 'user@originprotocol.com',
      otpKey: '123',
      otpVerified: true
    })
    this.grant = await Grant.create({
      userId: this.user.id,
      start: new Date('2018-10-10'),
      end: new Date('2021-10-10'),
      cliff: new Date('2019-10-10'),
      amount: 11125000,
      interval: 'days'
    })
  })

  it('should enqueue a transfer', async () => {
    const amount = 1000
    const transferId = await enqueueTransfer(
      this.grant.id,
      toAddress,
      amount,
      ip
    )

    // Check a transfer row was created and populated as expected.
    const transfer = await Transfer.findOne({ where: { id: transferId } })

    expect(transfer).to.be.an('object')
    expect(transfer.grantId).to.equal(this.grant.id)
    expect(transfer.toAddress).to.equal(toAddress.toLowerCase())
    expect(transfer.fromAddress).to.be.null
    expect(parseInt(transfer.amount)).to.equal(amount)
    expect(transfer.currency).to.equal('OGN')
    expect(transfer.txHash).to.be.null
    expect(transfer.data).to.be.null
  })

  it('should execute a transfer', async () => {
    // Enqueue and execute a transfer.
    const amount = 1000
    const transferId = await enqueueTransfer(
      this.grant.id,
      toAddress,
      amount,
      ip
    )
    const transfer = await Transfer.findOne({ where: { id: transferId } })
    const { txHash, txStatus } = await executeTransfer(transfer, {
      networkId,
      tokenMock
    })
    expect(txStatus).to.equal('confirmed')
    expect(txHash).to.equal('testTxHash')

    // Check the transfer row was updated as expected.
    transfer.reload()
    expect(transfer.status).to.equal(enums.TransferStatuses.Success)
  })
})
