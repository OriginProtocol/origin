// TODO: use newer-style import (something is wrong with test environment)
const chai = require('chai')
const expect = chai.expect
const BigNumber = require('bignumber.js')
chai.use(require('chai-moment'))
chai.use(require('chai-bignumber')(BigNumber))
const moment = require('moment')

const { Grant } = require('../src/models')

const dateFormat = 'YYYY-MM-DD HH:mm:ss'

describe('Grant Model', () => {
  let grant

  beforeEach(() => {
    grant = new Grant({
      email: 'cryptopup@originprotocol.com',
      grantedAt: '2014-01-01 00:00:00',
      amount: 4800,
      totalMonths: 48,
      cliffMonths: 12,
      vested: 0,
      transferred: 0
    })
  })

  describe('4 year grant with 1 year cliff then monthly vesting', () => {
    it('should not vest at all before cliff', () => {
      grant.now = moment(grant.grantedAt).add(grant.cliffMonths, 'M').subtract(1, 's')
      expect(grant.calculateVested()).to.bignumber.equal(0)
    })

    it('should vest 1/4 at cliff', () => {
      grant.now = moment(grant.grantedAt).add(grant.cliffMonths, 'M')
      expect(grant.calculateVested()).to.bignumber.equal(grant.amount / 4)
    })

    it('should fully vest after 4 years', () => {
      grant.now = moment(grant.grantedAt).add(grant.totalMonths, 'M')
      expect(grant.calculateVested()).to.bignumber.equal(grant.amount)
    })

    it('should have the correct vesting schedule', () => {
      const schedule = grant.vestingSchedule()
      expect(schedule.length).to.equal(37)

      // Check vesting cliff
      expect(schedule[0].month).to.equal(12)
      expect(schedule[0].date.format(dateFormat)).to.equal('2015-01-01 00:00:00')
      expect(schedule[0].amount).to.bignumber.equal(1200)

      // Check monthly vesting after cliff
      for (let i = 1; i < schedule.length; i++) {
        const eventDate = moment(grant.grantedAt).add(grant.cliffMonths + i, 'M')
        const vestingEvent = schedule[i]
        expect(vestingEvent.date).to.be.sameMoment(eventDate)
        expect(vestingEvent.amount).to.bignumber.equal(100)
        expect(vestingEvent.month).to.equal(grant.cliffMonths + i)
      }
    })
  })

  describe('1 year monthly vesting with no cliff', () => {
    let grant

    beforeEach(() => {
      grant = new Grant({
        email: 'cryptopup@originprotocol.com',
        grantedAt: '2013-12-31 00:00:00',
        amount: 1200,
        totalMonths: 12,
        cliffMonths: 0,
        vested: 0,
        transferred: 0
      })
    })

    it('should generate a vesting schedule on the last day of each month', () => {
      // Because the grant date is 12/31 and not every month has 31 days, the
      // generated vesting schedule rounds down to the last day of each month
      const schedule = grant.vestingSchedule()
      const expectedDates = [
        moment('2014-01-31 00:00:00'),
        moment('2014-02-28 00:00:00'),
        moment('2014-03-31 00:00:00'),
        moment('2014-04-30 00:00:00'),
        moment('2014-05-31 00:00:00'),
        moment('2014-06-30 00:00:00'),
        moment('2014-07-31 00:00:00'),
        moment('2014-08-31 00:00:00'),
        moment('2014-09-30 00:00:00'),
        moment('2014-10-31 00:00:00'),
        moment('2014-11-30 00:00:00'),
        moment('2014-12-31 00:00:00')
      ]
      expect(schedule.length).to.equal(expectedDates.length)
      for (let i = 0; i < schedule.length; i++) {
        expect(schedule[i].date).to.be.sameMoment(expectedDates[i])
        expect(schedule[i].amount).to.bignumber.equal(100)
        expect(schedule[i].month).to.equal(i + 1)
      }
    })

    it('should not vest any tokens before the first month', () => {
      grant.now = moment(grant.grantedAt).add(1, 'M').subtract(1, 's')
      expect(grant.calculateVested()).to.bignumber.equal(0)
    })

    it('should vest at 1 month', () => {
      grant.now = moment(grant.grantedAt).add(1, 'M')
      expect(grant.calculateVested()).to.bignumber.equal(100)
    })

    it ('should fully vest after 1 year', () => {
      grant.now = moment(grant.grantedAt).add(grant.totalMonths, 'M')
      expect(grant.calculateVested()).to.bignumber.equal(grant.amount)
    })
  })

  describe('grant whose token amount does not divide cleanly', () => {
    let grant

    beforeEach(() => {
      grant = new Grant({
        email: 'cryptopup@originprotocol.com',
        grantedAt: '2013-12-31 00:00:00',
        amount: 1000,
        totalMonths: 12,
        cliffMonths: 0,
        vested: 0,
        transferred: 0
      })
    })

    it('should fully vest after 12 months', () => {
      grant.now = moment(grant.grantedAt).add(grant.totalMonths, 'M')
      expect(grant.calculateVested()).to.bignumber.equal(grant.amount)
    })
  })

  describe('one-time token grant', () => {
    let grant

    beforeEach(() => {
      grant = new Grant({
        email: 'cryptopup@originprotocol.com',
        grantedAt: '2013-01-01 00:00:00',
        amount: 100,
        totalMonths: 0,
        cliffMonths: 0,
        vested: 0,
        transferred: 0
      })
    })

    it('should vest immediately', () => {
      grant.now = moment(grant.grantedAt)
      expect(grant.calculateVested()).to.bignumber.equal(grant.amount)
    })

    it('should not vest before grant date', () => {
      // Grant date could be in the future, so we don't vest before then.
      grant.now = moment(grant.grantedAt).subtract(1, 's')
      expect(grant.calculateVested()).to.bignumber.equal(0)
    })
  })
})
