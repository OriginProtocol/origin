const BigNumber = require('bignumber.js')
const chai = require('chai')
chai.use(require('chai-moment'))
chai.use(require('chai-bignumber')(BigNumber))
const expect = chai.expect
const moment = require('moment')
const sinon = require('sinon')

const { Grant, User, sequelize } = require('../../src/models')
const {
  momentizeGrant,
  vestedAmount,
  vestingSchedule
} = require('../../src/lib/vesting')

// Sets up clean database
async function setupDatabase() {
  expect(process.env.NODE_ENV).to.equal('test')
  await sequelize.sync({ force: true })
}

describe('Employee vesting', () => {
  describe('4 year grant with 1 year cliff', () => {
    let grant

    beforeEach(async () => {
      await setupDatabase()
      this.user = await User.create({
        email: 'user+employee@originprotocol.com',
        otpKey: '123',
        otpVerified: true,
        employee: true
      })
      const grantObj = new Grant({
        userId: this.user.id,
        start: '2014-01-01 00:00:00',
        end: '2018-01-01 00:00:00',
        cliff: '2015-01-01 00:00:00',
        amount: 4800
      })
      await grantObj.save()
      grant = momentizeGrant(grantObj.get({ plain: true }))
    })

    it('should not vest before cliff', () => {
      const clock = sinon.useFakeTimers(
        moment.utc(grant.cliff).subtract(1, 's').valueOf()
      )
      const amount = vestedAmount(this.user, grant)
      expect(amount).to.be.bignumber.equal(0)
      clock.restore()
    })

    it('should vest 12/48 at the cliff', () => {
      const clock = sinon.useFakeTimers(
        moment(grant.cliff).valueOf()
      )
      const amount = vestedAmount(this.user, grant)
      expect(amount).to.be.bignumber.equal(1200)
      clock.restore()
    })

    it('should vest 12/48 after the cliff', () => {
      const clock = sinon.useFakeTimers(
        moment(grant.cliff).add(1, 's').valueOf()
      )
      const amount = vestedAmount(this.user, grant)
      expect(amount).to.be.bignumber.equal(1200)
      clock.restore()
    })

    it('should have vested the correct total at grant end', async () => {
      const clock = sinon.useFakeTimers(
        moment(grant.end).valueOf()
      )
      const amount = vestedAmount(this.user, grant)
      expect(amount).to.be.bignumber.equal(4800)
      clock.restore()
    })

    it('should vest the correct amount each month', () => {
      const clock = sinon.useFakeTimers(
        moment.utc(grant.end)
      )
      const schedule = vestingSchedule(this.user, grant)
      // Remove the first element of the array, which is the cliff vest
      schedule.shift()
      // Remove the last element in the array, which has any rounding errors
      // All subsequent vesting events should vest the correct proportion
      schedule.every(e => expect(e.amount).to.be.bignumber.equal(100))
      clock.restore()
    })
  })
})

describe('Investor vesting', () => {
    let grant

    beforeEach(async () => {
      await setupDatabase()
      this.user = await User.create({
        email: 'user+investor@originprotocol.com',
        otpKey: '123',
        otpVerified: true,
      })
      const grantObj = new Grant({
        userId: this.user.id,
        start: '2014-01-01 00:00:00',
        end: '2016-01-01 00:00:00',
        amount: 10000
      })
      await grantObj.save()
      grant = momentizeGrant(grantObj.get({ plain: true }))
    })

  it('should vest 6% at start of grant', async () => {
  })

  it('should vest 11.75% each quarter after 4 months', async() => {
  })

  it('should have vested the correct total at grant end', async () => {
  })
})
