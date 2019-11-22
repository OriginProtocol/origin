const chai = require('chai')
const expect = chai.expect
const moment = require('moment')
const base32 = require('thirty-two')
const crypto = require('crypto')

const { Grant, Transfer, User, sequelize } = require('../../src/models')
const { encrypt } = require('../../src/lib/crypto')
const enums = require('../../src/enums')
const {
  initWatchdog,
  executeTransfers,
  clearWatchdog
} = require('../../src/tasks/transfer')

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
        amount: 1000000
      }),
      // Fully unvested grant
      await Grant.create({
        userId: this.user.id,
        start: moment().add(10, 'years'),
        end: moment().add(14, 'years'),
        cliff: moment().add(11, 'years'),
        amount: 10000000
      })
    ]
  })

  it('should not run if watchdog exists', () => {
    initWatchdog()
    expect(executeTransfers).to.throw(/Watchdog/)
    clearWatchdog()
  })

  it('should not run if unconfirmed transfers exist', async () => {
    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.WaitingConfirmation,
      toAddress: toAddress,
      amount: 1,
      currency: 'OGN'
    })

    expect(executeTransfers).to.throw(/Found unconfirmed/)
  })

  it('should not run if processing transfers exist', async () => {
    await Transfer.create({
      userId: this.user.id,
      status: enums.TransferStatuses.Processing,
      toAddress: toAddress,
      amount: 1,
      currency: 'OGN'
    })

    expect(executeTransfers).to.throw(/Found unconfirmed/)
  })

  it('should execute a small transfer immediately', () => {})

  it('should not execute a large transfer before cutoff time', () => {})

  it('should execute a large transfer after the cutoff time', () => {})

  it('should record transfer success', () => {})

  it('should record transfer failure', () => {})

  it('should record transfer timeout', () => {})
})
