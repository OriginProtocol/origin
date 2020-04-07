const BigNumber = require('bignumber.js')
const chai = require('chai')
chai.use(require('chai-as-promised'))
chai.use(require('chai-bignumber')(BigNumber))
chai.use(require('chai-moment'))
const expect = chai.expect
const moment = require('moment')
const totp = require('notp').totp
const sinon = require('sinon')

const {
  calculateGranted,
  calculateVested,
  calculateUnlockedEarnings,
  calculateEarnings,
  calculateLocked,
  calculateNextVestLocked,
  getNextVest
} = require('../../src/shared')
const { Grant, Lockup, User, sequelize } = require('../../src/models')

describe('Shared library', () => {
  beforeEach(async () => {
    expect(process.env.NODE_ENV).to.equal('test')
    // Wipe database before each test
    await sequelize.sync({ force: true })

    this.user = await User.create({
      email: 'user@originprotocol.com',
      name: 'User 1',
      otpKey: '123',
      otpVerified: true,
      employee: true
    })

    this.grant = await Grant.create({
      userId: this.user.id,
      start: moment.utc().subtract(2, 'years'),
      end: moment.utc().add(2, 'years'),
      cliff: moment.utc().subtract(1, 'years'),
      amount: 100000
    })
  })

  it('should calculate granted', () => {
    expect(
      calculateGranted([this.grant.get({ plain: true })])
    ).to.be.bignumber.equal(100000)
  })

  it('should calculate vested', () => {
    // Not 50% due to rounding down
    expect(
      calculateVested(this.user, [this.grant.get({ plain: true })])
    ).to.be.bignumber.equal(49996)
  })

  it('should calculate unlocked earnings', async () => {
    const incompleteLockups = [
      (
        await Lockup.create({
          userId: this.user.id,
          amount: 1000,
          start: moment.utc(),
          end: moment.utc().add(1, 'years'),
          code: totp.gen(this.otpKey),
          bonusRate: 10.0,
          confirmed: true
        })
      ).get({ plain: true })
    ]

    expect(calculateUnlockedEarnings(incompleteLockups)).to.be.bignumber.equal(
      0
    )

    const completeLockups = [
      (
        await Lockup.create({
          userId: this.user.id,
          amount: 1000,
          start: moment.utc().subtract(1, 'years'),
          end: moment.utc(),
          code: totp.gen(this.otpKey),
          bonusRate: 10.0,
          confirmed: true
        })
      ).get({ plain: true })
    ]

    expect(calculateUnlockedEarnings(completeLockups)).to.be.bignumber.equal(
      100
    )
  })

  it('should calculate all earnings', async () => {
    const incompleteLockups = [
      (
        await Lockup.create({
          userId: this.user.id,
          amount: 1000,
          start: moment.utc(),
          end: moment.utc().add(1, 'years'),
          code: totp.gen(this.otpKey),
          bonusRate: 10.0,
          confirmed: true
        })
      ).get({ plain: true })
    ]

    const completeLockups = [
      (
        await Lockup.create({
          userId: this.user.id,
          amount: 1000,
          start: moment.utc().subtract(1, 'years'),
          end: moment.utc(),
          code: totp.gen(this.otpKey),
          bonusRate: 10.0,
          confirmed: true
        })
      ).get({ plain: true })
    ]

    const lockups = [...incompleteLockups, ...completeLockups]

    expect(calculateEarnings(lockups)).to.be.bignumber.equal(200)
  })

  it('should exclude early lockups for unvested tokens from locked calculation', async () => {
    const nextVest = getNextVest(
      [this.grant.get({ plain: true })],
      this.user.get({ plain: true })
    )

    // Lock up entire next vest
    const lockups = [
      (
        await Lockup.create({
          userId: this.user.id,
          amount: Number(nextVest.amount),
          start: moment().subtract(1, 'days'),
          end: moment()
            .add(1, 'years')
            .add(1, 'days'),
          bonusRate: 10.0,
          data: {
            vest: nextVest
          },
          confirmed: true
        })
      ).get({ plain: true })
    ]

    expect(calculateLocked(lockups)).to.be.bignumber.equal(0)
  })

  it('should include early lockups for vested tokens from locked calculation', async () => {
    const nextVest = getNextVest(
      [this.grant.get({ plain: true })],
      this.user.get({ plain: true })
    )

    // Lock up entire next vest
    const lockups = [
      (
        await Lockup.create({
          userId: this.user.id,
          amount: Number(nextVest.amount),
          start: moment().subtract(1, 'days'),
          end: moment()
            .add(1, 'years')
            .add(1, 'days'),
          bonusRate: 10.0,
          data: {
            vest: nextVest
          },
          confirmed: true
        })
      ).get({ plain: true })
    ]

    // Jump passed next vest
    const clock = sinon.useFakeTimers(
      moment
        .utc(nextVest.date)
        .add(1, 'seconds')
        .valueOf()
    )

    expect(calculateLocked(lockups)).to.be.bignumber.equal(nextVest.amount)

    clock.restore()
  })

  it('should calculate next vest locked', async () => {
    const nextVest = getNextVest(
      [this.grant.get({ plain: true })],
      this.user.get({ plain: true })
    )

    // Lock up entire next vest
    const lockups = [
      (
        await Lockup.create({
          userId: this.user.id,
          amount: Number(nextVest.amount),
          start: moment().subtract(1, 'days'),
          end: moment()
            .add(1, 'years')
            .add(1, 'days'),
          bonusRate: 10.0,
          data: {
            vest: nextVest
          },
          confirmed: true
        })
      ).get({ plain: true })
    ]

    expect(calculateNextVestLocked(lockups)).to.be.bignumber.equal(
      nextVest.amount
    )
  })
})
