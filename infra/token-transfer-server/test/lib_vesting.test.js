const chai = require('chai')
chai.use(require('chai-moment'))
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

describe('vestGrant', () => {
  describe('4 year grant with 1 year cliff', () => {
    let grant

    beforeEach(async () => {
      await setupDatabase()

      grant = new Grant({
        email: testEmail,
        grantedAt: '2014-01-01 00:00:00',
        amount: 4800,
        totalMonths: 48,
        cliffMonths: 12,
        vested: 0,
        transferred: 0
      })
      await grant.save()

      const grants = await Grant.findAll()
      expect(grants.length).to.equal(1)
    })

    it('should not vest before cliff', async () => {
      grant.now = moment(grant.grantedAt).add(grant.cliffMonths, 'M').subtract(1, 's')
      await vestGrant(grant)

      grant = await Grant.findByPk(grant.id)
      expect(grant).to.not.be.undefined
      expect(grant.vested).to.equal(0)
      const events = await Event.findAll()
      expect(events.length).to.equal(0)
    })

    it('should vest 1/4 at the cliff', async () => {
      grant.now = moment(grant.grantedAt).add(grant.cliffMonths, 'M')
      await vestGrant(grant)

      const expectedVested = grant.amount / 4
      grant = await Grant.findByPk(grant.id)
      expect(grant).to.not.be.undefined
      expect(grant.vested).to.equal(expectedVested)

      grant = await Grant.findByPk(grant.id)
      expect(grant).to.not.be.undefined
      expect(grant.vested).to.bignumber.equal(expectedVested)

      const events = await Event.findAll()
      expect(events.length).to.equal(1)
      expect(events[0].id).to.equal(1)
      expect(events[0].email).to.equal(testEmail)
      expect(events[0].ip).to.be.ok
      expect(events[0].action).to.equal(GRANT_VEST)
      const data = JSON.parse(events[0].data)
      expect(data.amount).to.equal(expectedVested)
      expect(data.vestDate).to.equal('2015-01-01')
    })

    it('should perform catch-up vesting', async () => {
      grant.now = moment(grant.grantedAt).add(grant.cliffMonths + 2, 'M')
      await vestGrant(grant)

      const monthlyAmount = grant.amount / 48
      const cliffAmount = grant.amount / 4
      const expectedVested = cliffAmount + monthlyAmount * 2

      grant = await Grant.findByPk(grant.id)
      expect(grant).to.not.be.undefined
      expect(grant.vested).to.equal(expectedVested)

      const events = await Event.findAll()
      expect(events.length).to.equal(3)
      let data

      expect(events[0].id).to.equal(1)
      expect(events[0].email).to.equal(testEmail)
      expect(events[0].ip).to.be.ok
      expect(events[0].action).to.equal(GRANT_VEST)
      data = JSON.parse(events[0].data)
      expect(data.amount).to.equal(cliffAmount)
      expect(data.vestDate).to.equal('2015-01-01')

      expect(events[1].id).to.equal(2)
      expect(events[1].email).to.equal(testEmail)
      expect(events[1].ip).to.be.ok
      expect(events[1].action).to.equal(GRANT_VEST)
      data = JSON.parse(events[1].data)
      expect(data.amount).to.equal(monthlyAmount)
      expect(data.vestDate).to.equal('2015-02-01')

      expect(events[2].id).to.equal(3)
      expect(events[2].email).to.equal(testEmail)
      expect(events[2].ip).to.be.ok
      expect(events[2].action).to.equal(GRANT_VEST)
      data = JSON.parse(events[2].data)
      expect(data.amount).to.equal(monthlyAmount)
      expect(data.vestDate).to.equal('2015-03-01')
    })
  })
})

describe('vestGrants', () => {
  let vestedGrant, grant

  beforeEach(async () => {
    await setupDatabase()

    vestedGrant = new Grant({
      email: 'throwaway@originprotocol.com',
      grantedAt: '2014-01-01 00:00:00',
      amount: 1000,
      totalMonths: 0,
      cliffMonths: 0,
      vested: 1000,
      transferred: 0
    })
    await vestedGrant.save()

    grant = new Grant({
      email: testEmail,
      grantedAt: '2014-01-01 00:00:00',
      amount: 4800,
      totalMonths: 48,
      cliffMonths: 12,
      vested: 0,
      transferred: 0
    })
    await grant.save()
  })

  it('should only vest grants that need vesting', async () => {
    // Perform vesting 1 year after 'grant' was granted.
    const now = moment(grant.grantedAt).add(grant.cliffMonths, 'M')
    await vestGrants(now)

    await vestedGrant.reload()
    expect(vestedGrant.vested).to.equal(1000)
    await grant.reload()
    expect(grant.vested).to.equal(1200)

    const events = await Event.findAll()
    expect(events.length).to.equal(1)

    expect(events[0].id).to.equal(1)
    expect(events[0].email).to.equal(testEmail)
    expect(events[0].ip).to.be.ok
    expect(events[0].action).to.equal(GRANT_VEST)
    const data = JSON.parse(events[0].data)
    expect(data.amount).to.equal(1200)
    expect(data.vestDate).to.equal('2015-01-01')

    // Ensure that quick rerun doesn't vest more tokens.
    await vestGrants(now.add(1, 's'))
    await vestedGrant.reload()
    expect(vestedGrant.vested).to.equal(1000)
    await grant.reload()
    expect(grant.vested).to.equal(1200)
  })
})
