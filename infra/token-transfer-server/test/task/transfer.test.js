const chai = require('chai')
const expect = chai.expect
const moment = require('moment')
const base32 = require('thirty-two')
const crypto = require('crypto')
const sinon = require('sinon')

const {
  Event,
  Grant,
  Transfer,
  TransferTask,
  User,
  sequelize
} = require('../../src/models')
const { encrypt } = require('../../src/lib/crypto')
const enums = require('../../src/enums')
const { executeTransfers } = require('../../src/tasks/transfer')
const {
  largeTransferThreshold,
  largeTransferDelayMinutes
} = require('../../src/config')
const { TokenMock } = require('../util')

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
  })

  it('should not run if outstanding tasks exist', async () => {
    await TransferTask.create({
      start: moment.utc()
    })
    try {
      await executeTransfers(new TokenMock())
    } catch (error) {
      expect(error.message).to.match(/incomplete/)
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
      await executeTransfers(new TokenMock())
    } catch (error) {
      expect(error.message).to.match(/unconfirmed/)
    }
  })

  it('should execute a small transfer immediately', async () => {
    const transfer = await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Enqueued,
      toAddress: toAddress,
      amount: 1,
      currency: 'OGN'
    })

    await executeTransfers(new TokenMock())

    await transfer.reload()
    expect(transfer.status).to.equal(enums.TransferStatuses.WaitingConfirmation)

    const transferTasks = await TransferTask.findAll()
    expect(transferTasks[0].start).to.not.equal(null)
    expect(transferTasks[0].end).to.not.equal(null)
    expect(transfer.transferTaskId).to.equal(transferTasks[0].id)
  })

  it('should not execute a large transfer before cutoff time', async () => {
    const transfer = await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Enqueued,
      toAddress: toAddress,
      amount: largeTransferThreshold + 1,
      currency: 'OGN'
    })

    await executeTransfers(new TokenMock())

    // Move into the future
    const clock = sinon.useFakeTimers(
      moment
        .utc(transfer.createdAt)
        .add(largeTransferDelayMinutes - 1, 'minutes')
        .valueOf()
    )

    await executeTransfers(new TokenMock())

    const transferTasks = await TransferTask.findAll()
    expect(transferTasks[0].start).to.not.equal(null)
    expect(transferTasks[0].end).to.not.equal(null)
    expect(transfer.transferTaskId).to.equal(null)

    clock.restore()
  })

  it('should execute a large transfer after the cutoff time', async () => {
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

    await executeTransfers(new TokenMock())

    await transfer.reload()
    expect(transfer.status).to.equal(enums.TransferStatuses.WaitingConfirmation)

    const transferTasks = await TransferTask.findAll()
    expect(transferTasks[0].start).to.not.equal(null)
    expect(transferTasks[0].end).to.not.equal(null)
    expect(transfer.transferTaskId).to.equal(transferTasks[0].id)

    clock.restore()
  })

  it('should record transfer failure on failure to credit', async () => {
    const creditFake = sinon.fake.throws(
      new Error('Supplier balance is too low')
    )
    const credit = TokenMock.prototype.credit
    TokenMock.prototype.credit = creditFake

    const transfer = await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Enqueued,
      toAddress: toAddress,
      amount: 1,
      currency: 'OGN'
    })

    await executeTransfers(new TokenMock())

    await transfer.reload()
    expect(transfer.status).to.equal(enums.TransferStatuses.Failed)

    const transferTasks = await TransferTask.findAll()
    expect(transferTasks[0].start).to.not.equal(null)
    expect(transferTasks[0].end).to.not.equal(null)
    expect(transfer.transferTaskId).to.equal(transferTasks[0].id)

    const events = await Event.findAll()
    expect(events[0].action).to.equal('TRANSFER_FAILED')
    expect(events[0].data.transferId).to.equal(transfer.id)
    expect(events[0].data.failureReason).to.equal('Supplier balance is too low')

    // Restore mocked function
    TokenMock.prototype.credit = credit
  })

  // TODO
  it('should record success when checking block confirmation', async () => {})

  // TODO
  it('should record failure when checking block confirmation', async () => {})

  // TODO
  it('should record timeout when checking block confirmation', async () => {})
})
