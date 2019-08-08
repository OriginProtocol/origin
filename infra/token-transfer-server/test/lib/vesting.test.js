const BigNumber = require('bignumber.js')
const chai = require('chai')
chai.use(require('chai-moment'))
chai.use(require('chai-bignumber')(BigNumber))
const expect = chai.expect
const moment = require('moment')

const { Event, Grant, sequelize } = require('../../src/models')
const { momentizeGrant, vestedAmount, vestingEvents } = require('../../src/lib/vesting')

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
      grantObj = new Grant({
        userId: 1,
        start: '2014-01-01 00:00:00',
        end: '2018-01-01 00:00:00',
        cliff: '2015-01-01 00:00:00',
        amount: 4800,
        interval: 'months'
      })
      await grantObj.save()
      grant = momentizeGrant(grantObj.get({ plain: true }))
    })

    it('should have the correct amount of vesting events', () => {
      const events = vestingEvents(grant)
      expect(events.length).to.equal(48 - 12 + 1)
    })

    it('should not vest before cliff', () => {
      grant.now = moment(grant.cliff).subtract(1, 's')
      const amount = vestedAmount(grant)
      expect(amount).to.be.bignumber.equal(0)
    })

    it('should vest 12/48 at the cliff', () => {
      grant.now = grant.cliff
      const amount = vestedAmount(grant)
      expect(amount).to.be.bignumber.equal(1200)
    })

    it('should vest 12/48 after the cliff', () => {
      grant.now = moment(grant.cliff).add(1, 's')
      const amount = vestedAmount(grant)
      expect(amount).to.be.bignumber.equal(1200)
    })

    it('should have the correct amount vested total', () => {
      grant.now = grant.end
      const amount = vestedAmount(grant)
      expect(amount).to.be.bignumber.equal(4800)
    })

    it('should vest the correct amount each month', () => {
      grant.now = grant.end
      const events = vestingEvents(grant)
      // Remove the first element of the array, which is the cliff vest
      events.shift()
      // All subsequent vesting events should vest the correct proportion
      expect(events.every(e => e === 100)).to.equal(true)
    })
  })

  describe('4 year grant with 1 year cliff and daily vesting', () => {
    let grant

    beforeEach(async () => {
      await setupDatabase()
      grantObj = new Grant({
        userId: 1,
        start: '2014-01-01 00:00:00',
        end: '2018-01-01 00:00:00',
        cliff: '2015-01-01 00:00:00',
        amount: 4800,
        interval: 'days'
      })
      await grantObj.save()
      grant = momentizeGrant(grantObj.get({ plain: true }))
    })

    it('should have the correct amount of vesting events', () => {
      const events = vestingEvents(grant)
      // 2016 is a leap year, so there is 2 * 365 days for standard years,
      // 1 * 366 for the leap year, and + 1 for the cliff vesting event
      expect(events.length).to.equal(2 * 365 + 366 + 1)
    })

    it('should not vest before cliff', () => {
      grant.now = moment(grant.cliff).subtract(1, 's')
      const amount = vestedAmount(grant)
      expect(amount).to.be.bignumber.equal(0)
    })

    it('should vest 365/1461 at the cliff', () => {
      grant.now = grant.cliff
      const amount = vestedAmount(grant)
      expect(amount).to.be.bignumber.equal(
        Math.round(
          BigNumber(grant.amount)
            .div(1461)
            .times(365)
        )
      )
    })

    it('should vest 365/1461 after the cliff', () => {
      grant.now = moment(grant.cliff).add(1, 's')
      const amount = vestedAmount(grant)
      expect(amount).to.be.bignumber.equal(
        Math.round(
          BigNumber(grant.amount)
            .div(1461)
            .times(365)
        )
      )
    })

    it('should have the correct amount vested total', () => {
      grant.now = grant.end
      const amount = vestedAmount(grant)
      expect(amount).to.be.bignumber.equal(4800)
    })

    it('should vest the correct amount for a day', () => {
      grant.now = grant.end
      const events = vestingEvents(grant)
      // Remove the first element of the array, which is the cliff vest
      events.shift()
      expect(events[0]).to.be.bignumber.equal(
        Math.floor(BigNumber(grant.amount).div(1461))
      )
    })

    it('should vest the correct remainder on the last day', () => {
    })

    it('should vest the correct amount each day for non cliff vests', () => {
      grant.now = grant.end
      const events = vestingEvents(grant)
      // Remove the first element of the array, which is the cliff vest
      events.shift()
      // Remove the last element in the array, which carries remainder from
      // rounding errors
      events.pop()
      // All subsequent vesting events should vest the correct proportion
      expect(
        events.every(e => e === Math.floor(BigNumber(grant.amount).div(1461)))
      ).to.equal(true)
    })
  })

  /*
  describe('4 year grant with 1 year cliff and minutes vesting', () => {
    let grant

    const days = 2 * 365 + 366
    const minutes = days * 24 * 60
    const events = minutes + 1
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
      const events = vestingEvents(grant)
      // 2016 is a leap year, so there is 2 * 365 days for standard years,
      // 1 * 366 for the leap year, times 24 hours a day, 60 minutes an hour and
      // 60 seconds a minute, + 1 for the cliff vesting event
      expect(events.length).to.equal(minutes + 1)
    })

    it('should not vest before cliff', () => {
      grant.now = moment(grant.cliff).subtract(1, 's')
      const amount = vestedAmount(grant)
      expect(amount).to.be.bignumber.equal(0)
    })

    it('should vest 365/1461 at the cliff', () => {
      grant.now = grant.cliff
      const amount = vestedAmount(grant)
      expect(amount).to.be.bignumber.equal(BigNumber(365).div(1461).times(grant.amount))
    })

    it('should vest 365/1461 after the cliff', () => {
      grant.now = moment(grant.cliff).add(1, 's')
      const amount = vestedAmount(grant)
      expect(amount).to.be.bignumber.equal(BigNumber(365).div(1461).times(grant.amount))
    })

    it('should have the correct amount vested total', () => {
      grant.now = grant.end
      const amount = vestedAmount(grant)
      expect(amount).to.be.bignumber.equal(4800)
    })

    it('should vest the correct amount each day', () => {
      grant.now = grant.end
      const events = vestingEvents(grant)
      // Remove the first element of the array, which is the cliff vest
      vestingEvents.shift()
      // All subsequent vesting events should vest the correct proportion
      expect(events.every(e => {
        return e.amount === BigNumber(grant.amount).div(1461)
      })).to.equal(true)
    })
  })
  */
})
