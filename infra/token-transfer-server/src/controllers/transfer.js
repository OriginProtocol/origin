const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const moment = require('moment')
const { createProvider } = require('@origin/token/src/config')

const logger = require('../logger')
const { transferTokens } = require('../lib/transfer')
const { ensureLoggedIn } = require('../lib/login')
const { asyncMiddleware, isEthereumAddress } = require('../utils')

const networkId = Number.parseInt(process.env.NETWORK_ID) || 999
createProvider(networkId) // Ensure web3 credentials are set up

/**
 * Transfers tokens from hot wallet to address of user's choosing.
 */
router.post(
  '/api/transfer',
  [
    check('grantId').isInt(),
    check('amount').isDecimal(),
    check('address').custom(isEthereumAddress),
    ensureLoggedIn
  ],
  asyncMiddleware(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    // Retrieve the grant, validating email in the process.
    const { grantId, address, amount } = req.body
    try {
      const grant = await transferTokens({
        grantId,
        email: req.user.email,
        ip: req.connection.remoteAddress,
        networkId,
        address,
        amount
      })
      res.send(grant.get({ plain: true }))

      const grantedAt = moment(grant.grantedAt).format('YYYY-MM-DD')
      logger.info(
        `${grant.email} grant ${grantedAt} transferred ${amount} OGN to ${address}`
      )
    } catch (e) {
      if (e instanceof ReferenceError || e instanceof RangeError) {
        res.status(422).send(e.message)
      } else {
        throw e
      }
    }
  })
)

module.exports = router
