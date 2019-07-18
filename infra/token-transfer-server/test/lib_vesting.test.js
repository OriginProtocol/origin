const BigNumber = require('bignumber.js')
const chai = require('chai')
chai.use(require('chai-moment'))
chai.use(require('chai-bignumber')(BigNumber))
const expect = chai.expect
const moment = require('moment')

const { vestGrant, vestGrants } = require('../src/lib/vesting')
const { Event, Grant, sequelize } = require('../src/models')
const { GRANT_VEST } = require('../src/constants/events')

const testEmail = 'cryptopup@originprotocol.com'

// Sets up clean database
async function setupDatabase() {
  expect(process.env.NODE_ENV).to.equal('test')
  await sequelize.sync({ force: true })
  const grants = await Grant.findAll()
  expect(grants.length).to.equal(0)
  const events = await Event.findAll()
  expect(events.length).to.equal(0)
}

describe('vestingGrants', () => {
  describe('4 year grant with 1 year cliff and monthly vesting', () => {
    let grant

    beforeEach(async () => {
      await setupDatabase()
      grant = new Grant({
        userId: 1,
        start: '2014-01-01 00:00:00',
        end: '2018-01-01 00:00:00',
        cliff: '2015-01-01 00:00:00',
        amount: 4800,
        interval: 'months'
      })
      await grant.save()
    })

    it('should have the correct amount of vesting events', () => {
      const vestingEvents = grant.vestingSchedule()
      expect(vestingEvents.length).to.equal(48 - 12 + 1)
    })

    it('should not vest before cliff', () => {
      grant.now = moment(grant.cliff).subtract(1, 's')
      const vestedAmount = grant.calculateVested()
      expect(vestedAmount).to.be.bignumber.equal(0)
    })

    it('should vest 12/48 at the cliff', () => {
      grant.now = grant.cliff
      const vestedAmount = grant.calculateVested()
      expect(vestedAmount).to.be.bignumber.equal(1200)
    })

    it('should vest 12/48 after the cliff', () => {
      grant.now = moment(grant.cliff).add(1, 's')
      const vestedAmount = grant.calculateVested()
      expect(vestedAmount).to.be.bignumber.equal(1200)
    })

    it('should have the correct amount vested total', () => {
      grant.now = grant.end
      const vestedAmount = grant.calculateVested()
      expect(vestedAmount).to.be.bignumber.equal(4800)
    })

    it('should vest the correct amount each month', () => {
      grant.now = grant.end
      const vestingEvents = grant.vestingSchedule()
      // Remove the first element of the array, which is the cliff vest
      vestingEvents.shift()
      // All subsequent vesting events should vest the correct proportion
      expect(vestingEvents.every(e => e.isEqualTo(100))).to.equal(true)
    })
  })

  describe('4 year grant with 1 year cliff and daily vesting', () => {
    let grant

    beforeEach(async () => {
      await setupDatabase()
      grant = new Grant({
        userId: 1,
        start: '2014-01-01 00:00:00',
        end: '2018-01-01 00:00:00',
        cliff: '2015-01-01 00:00:00',
        amount: 4800,
        interval: 'days'
      })
      await grant.save()
    })

    it('should have the correct amount of vesting events', () => {
      const vestingEvents = grant.vestingSchedule()
      // 2016 is a leap year, so there is 2 * 365 days for standard years,
      // 1 * 366 for the leap year, and + 1 for the cliff vesting event
      expect(vestingEvents.length).to.equal(2 * 365 + 366 + 1)
    })

    it('should not vest before cliff', () => {
      grant.now = moment(grant.cliff).subtract(1, 's')
      const vestedAmount = grant.calculateVested()
      expect(vestedAmount).to.be.bignumber.equal(0)
    })

    it('should vest 365/1461 at the cliff', () => {
      grant.now = grant.cliff
      const vestedAmount = grant.calculateVested()
      expect(vestedAmount).to.be.bignumber.equal(
        BigNumber(365)
          .div(1461)
          .times(grant.amount)
      )
    })

    it('should vest 365/1461 after the cliff', () => {
      grant.now = moment(grant.cliff).add(1, 's')
      const vestedAmount = grant.calculateVested()
      expect(vestedAmount).to.be.bignumber.equal(
        BigNumber(365)
          .div(1461)
          .times(grant.amount)
      )
    })

    it('should have the correct amount vested total', () => {
      grant.now = grant.end
      const vestedAmount = grant.calculateVested()
      expect(vestedAmount).to.be.bignumber.equal(4800)
    })

    it('should vest the correct amount each day', () => {
      grant.now = grant.end
      const vestingEvents = grant.vestingSchedule()
      // Remove the first element of the array, which is the cliff vest
      vestingEvents.shift()
      // All subsequent vesting events should vest the correct proportion
      expect(
        vestingEvents.every(e => {
          return e.amount === BigNumber(grant.amount).div(1461)
        })
      ).to.equal(true)
    })
  })

  /*
  describe('4 year grant with 1 year cliff and minutes vesting', () => {
    let grant

    const days = 2 * 365 + 366
    const minutes = days * 24 * 60
    const vestingEvents = minutes + 1
    const cliffVestingEvents = 365 * 24 * 60

    beforeEach(async () => {
      await setupDatabase()
      grant = new Grant({
        userId: 1,
        start: '2014-01-01 00:00:00',
        end: '2018-01-01 00:00:00',
        cliff: '2015-01-01 00:00:00',
        amount: 4800,
        interval: 'minutes'
      })
      await grant.save()
    })

    it('should have the correct amount of vesting events', () => {
      const vestingEvents = grant.vestingSchedule()
      // 2016 is a leap year, so there is 2 * 365 days for standard years,
      // 1 * 366 for the leap year, times 24 hours a day, 60 minutes an hour and
      // 60 seconds a minute, + 1 for the cliff vesting event
      expect(vestingEvents.length).to.equal(minutes + 1)
    })

    it('should not vest before cliff', () => {
      grant.now = moment(grant.cliff).subtract(1, 's')
      const vestedAmount = grant.calculateVested()
      expect(vestedAmount).to.be.bignumber.equal(0)
    })

    it('should vest 365/1461 at the cliff', () => {
      grant.now = grant.cliff
      const vestedAmount = grant.calculateVested()
      expect(vestedAmount).to.be.bignumber.equal(BigNumber(365).div(1461).times(grant.amount))
    })

    it('should vest 365/1461 after the cliff', () => {
      grant.now = moment(grant.cliff).add(1, 's')
      const vestedAmount = grant.calculateVested()
      expect(vestedAmount).to.be.bignumber.equal(BigNumber(365).div(1461).times(grant.amount))
    })

    it('should have the correct amount vested total', () => {
      grant.now = grant.end
      const vestedAmount = grant.calculateVested()
      expect(vestedAmount).to.be.bignumber.equal(4800)
    })

    it('should vest the correct amount each day', () => {
      grant.now = grant.end
      const vestingEvents = grant.vestingSchedule()
      // Remove the first element of the array, which is the cliff vest
      vestingEvents.shift()
      // All subsequent vesting events should vest the correct proportion
      expect(vestingEvents.every(e => {
        return e.amount === BigNumber(grant.amount).div(1461)
      })).to.equal(true)
    })
  })
  */
})
