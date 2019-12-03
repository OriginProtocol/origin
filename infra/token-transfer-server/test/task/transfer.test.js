const chai = require('chai')
const expect = chai.expect
const moment = require('moment')
const base32 = require('thirty-two')
const crypto = require('crypto')
const sinon = require('sinon')

const { Event, Grant, Transfer, User, sequelize } = require('../../src/models')
const { encrypt } = require('../../src/lib/crypto')
const enums = require('../../src/enums')
const {
  initWatchdog,
  executeTransfers,
  clearWatchdog
} = require('../../src/tasks/transfer')
const {
  largeTransferThreshold,
  largeTransferDelayMinutes
} = require('../../src/config')
const { TokenMock } = require('../util')
const TransferLib = require('../../src/lib/transfer')

const toAddress = '0xf17f52151ebef6c7334fad080c5704d77216b732'

describe('Execute transfers', () => {
  beforeEach(async () => {
    // Wipe database before each test
    expect(process.env.NODE_ENV).to.equal('test')
    await sequelize.sync({ force: true })

    // Generate an OTP key
    this.otpKey = crypto.randomBytes(10).toString('hex')
    this.encodedKey = base32.encode(this.otpKey).toString()
    const encryptedKey = encrypt(this.otpKey)

    this.user = await User.create({
      email: 'user@originprotocol.com',
      name: 'User 1',
      otpKey: encryptedKey,
      otpVerified: true
    })

    this.grants = [
      await Grant.create({
        // Fully vested grant
        userId: this.user.id,
        start: moment().subtract(4, 'years'),
        end: moment(),
        cliff: moment().subtract(3, 'years'),
        amount: 10000000
      })
    ]

    clearWatchdog()
  })

  afterEach(async () => {
    TransferLib.__ResetDependency__('Token')
  })

  it('should not run if watchdog exists', async () => {
    initWatchdog()
    try {
      await executeTransfers()
    } catch (error) {
      expect(error.message).to.match(/Watchdog/)
    }
  })

  it('should not run if unconfirmed transfers exist', async () => {
    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.WaitingConfirmation,
      toAddress: toAddress,
      amount: 1,
      currency: 'OGN'
    })

    try {
      await executeTransfers()
    } catch (error) {
      expect(error.message).to.match(/unconfirmed/)
    }
  })

  it('should not run if processing transfers exist', async () => {
    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Processing,
      toAddress: toAddress,
      amount: 1,
      currency: 'OGN'
    })

    try {
      await executeTransfers()
    } catch (error) {
      expect(error.message).to.match(/unconfirmed/)
    }
  })

  it('should execute a small transfer immediately', async () => {
    const waitForTxConfirmationFake = sinon.fake.returns({
      status: 'confirmed',
      receipt: { txHash: '0x1234', blockNumber: 123, status: true }
    })
    const waitForTxConfirmation = TokenMock.prototype.waitForTxConfirmation
    TokenMock.prototype.waitForTxConfirmation = waitForTxConfirmationFake
    TransferLib.__Rewire__('Token', TokenMock)

    const transfer = await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Enqueued,
      toAddress: toAddress,
      amount: 1,
      currency: 'OGN'
    })

    await executeTransfers()

    await transfer.reload()
    expect(transfer.status).to.equal(enums.TransferStatuses.Success)

    expect(waitForTxConfirmationFake.called).to.equal(true)

    const events = await Event.findAll()
    expect(events[0].action).to.equal('TRANSFER_DONE')
    expect(events[0].data.transferId).to.equal(transfer.id)
    TokenMock.prototype.waitForTxConfirmation = waitForTxConfirmation
  })

  it('should not execute a large transfer before cutoff time', async () => {
    const waitForTxConfirmationFake = sinon.fake.returns({
      status: 'confirmed',
      receipt: { txHash: '0x1234', blockNumber: 123, status: true }
    })
    const waitForTxConfirmation = TokenMock.prototype.waitForTxConfirmation
    TokenMock.prototype.waitForTxConfirmation = waitForTxConfirmationFake
    TransferLib.__Rewire__('Token', TokenMock)

    const transfer = await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Enqueued,
      toAddress: toAddress,
      amount: largeTransferThreshold + 1,
      currency: 'OGN'
    })

    await executeTransfers()

    expect(waitForTxConfirmationFake.called).to.equal(false)

    // Transfer should not have been executed so fake should not have been called
    expect(waitForTxConfirmationFake.called).to.equal(false)
    //
    // Move into the future
    const clock = sinon.useFakeTimers(
      moment
        .utc(transfer.createdAt)
        .add(largeTransferDelayMinutes - 1, 'minutes')
        .valueOf()
    )

    await executeTransfers()

    // Transfer should not have been executed so fake should not have been called
    expect(waitForTxConfirmationFake.called).to.equal(false)

    clock.restore()
    TokenMock.prototype.waitForTxConfirmation = waitForTxConfirmation
  })

  it('should execute a large transfer after the cutoff time', async () => {
    const waitForTxConfirmationFake = sinon.fake.returns({
      status: 'confirmed',
      receipt: { txHash: '0x1234', blockNumber: 123, status: true }
    })
    const waitForTxConfirmation = TokenMock.prototype.waitForTxConfirmation
    TokenMock.prototype.waitForTxConfirmation = waitForTxConfirmationFake
    TransferLib.__Rewire__('Token', TokenMock)

    const transfer = await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Enqueued,
      toAddress: toAddress,
      amount: largeTransferThreshold + 1,
      currency: 'OGN'
    })

    // Move into the future
    const clock = sinon.useFakeTimers(
      moment
        .utc(transfer.createdAt)
        .add(largeTransferDelayMinutes + 1, 'minutes')
        .valueOf()
    )

    await executeTransfers()

    // Transfer should have been executed so fake should have been called
    expect(waitForTxConfirmationFake.called).to.equal(true)

    clock.restore()

    const events = await Event.findAll()
    expect(events[0].action).to.equal('TRANSFER_DONE')
    expect(events[0].data.transferId).to.equal(transfer.id)
    TokenMock.prototype.waitForTxConfirmation = waitForTxConfirmation
  })

  it('should record transfer failure on failure to credit', async () => {
    const creditFake = sinon.fake.throws(
      new Error('Supplier balance is too low')
    )
    const credit = TokenMock.prototype.credit
    TokenMock.prototype.credit = creditFake
    TransferLib.__Rewire__('Token', TokenMock)

    const transfer = await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Enqueued,
      toAddress: toAddress,
      amount: 1,
      currency: 'OGN'
    })

    await executeTransfers()

    await transfer.reload()
    expect(transfer.status).to.equal(enums.TransferStatuses.Failed)

    const events = await Event.findAll()
    expect(events[0].action).to.equal('TRANSFER_FAILED')
    expect(events[0].data.transferId).to.equal(transfer.id)
    expect(events[0].data.failureReason).to.equal('Supplier balance is too low')
    TokenMock.prototype.credit = credit
  })

  it('should record transfer failure', async () => {
    const waitForTxConfirmationFake = sinon.fake.returns({
      status: 'failed'
    })
    const waitForTxConfirmation = TokenMock.prototype.waitForTxConfirmation
    TokenMock.prototype.waitForTxConfirmation = waitForTxConfirmationFake
    TransferLib.__Rewire__('Token', TokenMock)

    const transfer = await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Enqueued,
      toAddress: toAddress,
      amount: 1,
      currency: 'OGN'
    })

    await executeTransfers()

    await transfer.reload()
    expect(transfer.status).to.equal(enums.TransferStatuses.Failed)

    const events = await Event.findAll()
    expect(events[0].action).to.equal('TRANSFER_FAILED')
    expect(events[0].data.transferId).to.equal(transfer.id)
    expect(events[0].data.failureReason).to.equal(undefined)
    TokenMock.prototype.waitForTxConfirmation = waitForTxConfirmation
  })

  it('should record transfer timeout', async () => {
    const waitForTxConfirmationFake = sinon.fake.returns({
      status: 'timeout'
    })
    const waitForTxConfirmation = TokenMock.prototype.waitForTxConfirmation
    TokenMock.prototype.waitForTxConfirmation = waitForTxConfirmationFake
    TransferLib.__Rewire__('Token', TokenMock)

    const transfer = await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Enqueued,
      toAddress: toAddress,
      amount: 1,
      currency: 'OGN'
    })

    await executeTransfers()

    await transfer.reload()
    expect(transfer.status).to.equal(enums.TransferStatuses.Failed)

    const events = await Event.findAll()
    expect(events[0].action).to.equal('TRANSFER_FAILED')
    expect(events[0].data.failureReason).to.equal('Confirmation timeout')
    expect(events[0].data.transferId).to.equal(transfer.id)
    TokenMock.prototype.waitForTxConfirmation = waitForTxConfirmation
  })
})
