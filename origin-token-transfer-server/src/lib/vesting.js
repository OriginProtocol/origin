const chalk = require('chalk')
const ip = require('ip')
const moment = require('moment')
const BigNumber = require('bignumber.js')
require('console.table')

const { Grant, Event, sequelize } = require('../models')
const { GRANT_VEST } = require('../constants/events')

async function vestGrant(grant) {
  const now = grant.now || moment()

  let totalVested = BigNumber(0)
  const txn = await sequelize.transaction()
  try {
    const grantedAt = moment(grant.grantedAt).format('YYYY-MM-DD')
    let newlyVested = BigNumber(0)
    // Log an event for each vesting event. This is important in case this is a
    // catch-up run for this tool. We want a separate log entry for each vesting
    // event for reporting purposes.
    for (const vestingEvent of grant.vestingSchedule()) {
      if (vestingEvent.date.isAfter(now)) {
        break
      }
      totalVested = totalVested.plus(vestingEvent.amount)
      if (totalVested.isLessThanOrEqualTo(grant.vested)) {
        continue
      }

      // Log event and increment vested counter for the grant.
      const vestingDateStr = vestingEvent.date.format('YYYY-MM-DD')
      await Event.create({
        email: grant.email,
        ip: ip.address(),
        grantId: grant.id,
        action: GRANT_VEST,
        data: JSON.stringify({
          amount: vestingEvent.amount.toNumber(),
          vestDate: vestingDateStr
        })
      })
      newlyVested = newlyVested.plus(vestingEvent.amount)
      if (process.env.NODE_ENV !== 'test') {
        console.log(
          chalk`{bold.hex('#26d198') ⬢}  Vested ${vestingEvent.amount.toNumber()} OGN for grant ${grantedAt} to ${
            grant.email
          } (effective ${vestingDateStr})`
        )
      }
    }

    // Sanity checks.
    grant.vested += newlyVested.toNumber()
    const calculatedVested = grant.calculateVested()
    if (grant.vested != calculatedVested) {
      throw new Error(
        `vested amount ${grant.vested} != calculated amount ${calculatedVested}`
      )
    }
    if (grant.vested > grant.amount) {
      throw new Error(
        `vested ${grant.vested} > grant ${grant.amount} for ${
          grant.email
        } ${grantedAt}`
      )
    }

    await grant.save()
    await txn.commit()
    return grant.id
  } catch (e) {
    await txn.rollback()
    throw e
  }
}

async function vestGrants(now = null) {
  let grantCount = 0
  let vestedCount = 0
  const grants = await Grant.findAll()
  for (const grant of grants) {
    if (now) {
      grant.now = now
    }

    grantCount++
    const tokensVested = grant.calculateVested()
    if (tokensVested.isGreaterThan(grant.vested)) {
      await vestGrant(grant)
      vestedCount++
    }
  }

  if (process.env.NODE_ENV !== 'test') {
    console.log(`\n✅ Vested ${vestedCount} of ${grantCount} grants.`)
  }
  return vestedCount
}

module.exports = { vestGrant, vestGrants }
