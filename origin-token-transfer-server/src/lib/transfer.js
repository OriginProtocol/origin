
const Token = require('origin-token/src/token')
const { createProviders } = require('origin-token/src/config')

const { GRANT_TRANSFER } = require('../constants/events')
const { Event, Grant, sequelize  } = require('../models')
/**
 * Transfers tokens for the given grant to an address. This function uses the
 * first account in the wallet.
 *
 * @param {Grant} grant - The grant for which we are transferring tokens
 * @param {*} email - Email associated with the grant
 * @param {*} ip - IP address of request
 * @param {*} networkId - ID of Ethereum network for the transfer
 * @param {*} address - Address to transfer tokens to
 * @param {*} amount - Amount (in token unit) to transfer
 * @param {*} tokenForTests - token object to use (for tests)
 * @return {Grant} = The updated grant that was transferred from
 */
async function transferTokens({
  grantId, email, ip, networkId, address, amount, tokenForTests = null
}) {
  const grant = await Grant.findOne({ where: {
    id: grantId,
    email: email
  } })
  if (!grant) {
    throw new ReferenceError(`Could not find specified grant`)
  }

  const available = grant.vested - grant.transferred
  if (amount > available) {
    throw new RangeError(`Amount of ${amount} OGN exceeds the ${available} OGN available for the grant`)
  }

  // Setup token library
  const config = {
    providers: createProviders([ networkId ])
  }
  const token = tokenForTests || new Token(config)

  // Transfer the tokens.
  const naturalAmount = token.toNaturalUnit(amount)
  const supplier = await token.defaultAccount(networkId)
  await token.credit(networkId, address, naturalAmount)

  // Record new state in the database.
  const txn = await sequelize.transaction()
  try {
    await grant.increment(['transferred'], { by: amount })
    await grant.save()
    await Event.create({
      email: email,
      ip: ip,
      grantId: grantId,
      action: GRANT_TRANSFER,
      data: JSON.stringify({
        amount: amount,
        from: supplier,
        to: address
      })
    })
    await txn.commit()
  } catch(e) {
    await txn.rollback()
    throw(e)
  }

  return grant
}

module.exports = { transferTokens }
