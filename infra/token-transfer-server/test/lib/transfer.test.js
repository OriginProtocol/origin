const BigNumber = require('bignumber.js')
const chai = require('chai')
chai.use(require('chai-as-promised'))
chai.use(require('chai-bignumber')(BigNumber))
chai.use(require('chai-moment'))
const expect = chai.expect
const moment = require('moment')

const {
  addTransfer,
  confirmTransfer,
  executeTransfer
} = require('../../src/lib/transfer')
const { Grant, Transfer, User, sequelize } = require('../../src/models')
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

describe('Token transfer library', () => {
  const networkId = 999
  const fromAddress = '0x627306090abaB3A6e1400e9345bC60c78a8BEf57'
  const toAddress = '0xf17f52151ebef6c7334fad080c5704d77216b732'
  const tokenMock = new TokenMock(networkId, fromAddress, toAddress)

  beforeEach(async () => {
    // Wipe database before each test
    expect(process.env.NODE_ENV).to.equal('test')
    await sequelize.sync({ force: true })

    this.user = await User.create({
      email: 'user@originprotocol.com',
      name: 'User 1',
      otpKey: '123',
      otpVerified: true
    })

    this.grant = await Grant.create({
      userId: this.user.id,
      start: new Date('2014-10-10'),
      end: new Date('2018-10-10'),
      cliff: new Date('2015-10-10'),
      amount: 100000,
      interval: 'days'
    })
  })

  it('should add a transfer', async () => {
    const amount = 1000
    const transfer = await addTransfer(this.user.id, toAddress, amount)
    // Check a transfer row was created and populated as expected.
    expect(transfer).to.be.an('object')
    expect(transfer.userId).to.equal(this.user.id)
    expect(transfer.toAddress).to.equal(toAddress.toLowerCase())
    expect(transfer.fromAddress).to.be.null
    expect(parseInt(transfer.amount)).to.equal(amount)
    expect(transfer.currency).to.equal('OGN')
    expect(transfer.txHash).to.be.null
    expect(transfer.data).to.be.an('object')
  })

  it('should add a transfer where required amount spans multiple grants', async () => {
    await Grant.create({
      userId: this.user.id,
      start: new Date('2014-10-10'),
      end: new Date('2018-10-10'),
      cliff: new Date('2015-10-10'),
      amount: 1,
      interval: 'days'
    })
    const amount = 100001
    const transfer = await addTransfer(this.user.id, toAddress, amount)
    // Check a transfer row was created and populated as expected.
    expect(transfer).to.be.an('object')
    expect(transfer.userId).to.equal(this.user.id)
    expect(transfer.toAddress).to.equal(toAddress.toLowerCase())
    expect(transfer.fromAddress).to.be.null
    expect(parseInt(transfer.amount)).to.equal(amount)
    expect(transfer.currency).to.equal('OGN')
    expect(transfer.txHash).to.be.null
    expect(transfer.data).to.be.an('object')
  })

  it('should add ignoring failed transfer amounts', async () => {
    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Failed,
      toAddress: toAddress,
      amount: 2,
      currency: 'OGN'
    })

    const amount = 99999
    await addTransfer(this.user.id, toAddress, amount)
  })

  it('should add ignoring cancelled transfer amounts', async () => {
    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Cancelled,
      toAddress: toAddress,
      amount: 2,
      currency: 'OGN'
    })

    const amount = 99999
    await addTransfer(this.user.id, toAddress, amount)
  })

  it('should add ignoring expired transfer amounts', async () => {
    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Expired,
      toAddress: toAddress,
      amount: 2,
      currency: 'OGN'
    })

    const amount = 99999
    await addTransfer(this.user.id, toAddress, amount)
  })

  it('should not add a transfer if not enough tokens (vested)', async () => {
    const amount = 100001
    await expect(
      addTransfer(this.user.id, toAddress, amount)
    ).to.eventually.be.rejectedWith(/exceeds/)
  })

  it('should not add a transfer if not enough tokens (vested minus waiting 2fa)', async () => {
    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.WaitingTwoFactor,
      toAddress: toAddress,
      amount: 2,
      currency: 'OGN'
    })

    const amount = 99999
    await expect(
      addTransfer(this.user.id, toAddress, amount)
    ).to.eventually.be.rejectedWith(/exceeds/)
  })

  it('should not add a transfer if not enough tokens (vested minus enqueued)', async () => {
    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Enqueued,
      toAddress: toAddress,
      amount: 2,
      currency: 'OGN'
    })

    const amount = 99999
    await expect(
      addTransfer(this.user.id, toAddress, amount)
    ).to.eventually.be.rejectedWith(/exceeds/)
  })

  it('should not add a transfer if not enough tokens (vested minus paused)', async () => {
    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Paused,
      toAddress: toAddress,
      amount: 2,
      currency: 'OGN'
    })

    const amount = 99999
    await expect(
      addTransfer(this.user.id, toAddress, amount)
    ).to.eventually.be.rejectedWith(/exceeds/)
  })

  it('should not add a transfer if not enough tokens (vested minus waiting)', async () => {
    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.WaitingConfirmation,
      toAddress: toAddress,
      amount: 2,
      currency: 'OGN'
    })

    const amount = 99999
    await expect(
      addTransfer(this.user.id, toAddress, amount)
    ).to.eventually.be.rejectedWith(/exceeds/)
  })

  it('should not add a transfer if not enough tokens (vested minus success)', async () => {
    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Success,
      toAddress: toAddress,
      amount: 2,
      currency: 'OGN'
    })

    const amount = 99999
    await expect(
      addTransfer(this.user.id, toAddress, amount)
    ).to.eventually.be.rejectedWith(/exceeds/)
  })

  it('should not add a transfer if not enough tokens (multiple states)', async () => {
    const promises = [
      enums.TransferStatuses.WaitingTwoFactor,
      enums.TransferStatuses.Enqueued,
      enums.TransferStatuses.Paused,
      enums.TransferStatuses.WaitingConfirmation,
      enums.TransferStatuses.Success
    ].map(status => {
      return Transfer.create({
        userId: this.user.id,
        status: status,
        toAddress: toAddress,
        amount: 2,
        currency: 'OGN'
      })
    })

    await Promise.all(promises)

    const amount = 99991
    await expect(
      addTransfer(this.user.id, toAddress, amount)
    ).to.eventually.be.rejectedWith(/exceeds/)
  })

  it('should execute a transfer', async () => {
    // Enqueue and execute a transfer.
    const amount = 1000
    const transfer = await addTransfer(this.user.id, toAddress, amount)
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

  it('should confirm a transfer', async () => {
    const transfer = await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.WaitingTwoFactor,
      toAddress: toAddress,
      amount: 2,
      currency: 'OGN'
    })

    await confirmTransfer(transfer)
    expect(transfer.status).to.equal(enums.TransferStatuses.Enqueued)
  })

  it('should not confirm a transfer greater than the grant size', async () => {
    const transfer = await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.WaitingTwoFactor,
      toAddress: toAddress,
      amount: 100001,
      currency: 'OGN'
    })
    await expect(confirmTransfer(transfer)).to.eventually.be.rejectedWith(
      /exceeds/
    )
  })

  it('should not confirm a transfer where tokens already withdrawn', async () => {
    const transfer = await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.WaitingTwoFactor,
      toAddress: toAddress,
      amount: 100000,
      currency: 'OGN'
    })
    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.WaitingTwoFactor,
      toAddress: toAddress,
      amount: 1,
      currency: 'OGN'
    })
    await expect(confirmTransfer(transfer)).to.eventually.be.rejectedWith(
      /exceeds/
    )
  })

  it('should not confirm a transfer in any state except waiting for two factor', async () => {
    const transfers = await Promise.all(
      [
        enums.TransferStatuses.Enqueued,
        enums.TransferStatuses.Paused,
        enums.TransferStatuses.WaitingConfirmation,
        enums.TransferStatuses.Success,
        enums.TransferStatuses.Failed,
        enums.TransferStatuses.Cancelled,
        enums.TransferStatuses.Expired
      ].map(status => {
        return Transfer.create({
          userId: this.user.id,
          status: status,
          toAddress: toAddress,
          amount: 2,
          currency: 'OGN'
        })
      })
    )

    await Promise.all(
      transfers.map(async transfer => {
        await expect(confirmTransfer(transfer)).to.eventually.be.rejectedWith(
          /is not waiting for confirmation/
        )
      })
    )
  })

  it('should not confirm a transfer that passed the timeout', async () => {
    const transfer = await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.WaitingTwoFactor,
      toAddress: toAddress,
      amount: 1,
      currency: 'OGN',
      createdAt: moment().subtract(10, 'minutes')
    })
    await expect(confirmTransfer(transfer)).to.eventually.be.rejectedWith(
      /required time/
    )
  })
})
