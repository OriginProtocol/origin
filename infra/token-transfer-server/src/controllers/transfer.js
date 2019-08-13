const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const moment = require('moment')
const { createProvider } = require('@origin/token/src/config')

const logger = require('../logger')
const { Grant, Transfer } = require('../../src/models')
const { transferTokens } = require('../lib/transfer')
const { ensureLoggedIn } = require('../lib/login')
const { asyncMiddleware, isEthereumAddress } = require('../utils')
const { networkId } = require('../config')

createProvider(networkId) // Ensure web3 credentials are set up

/*
 * Returns transfers for the authenticated user.
 */
router.get(
  '/transfers',
  ensureLoggedIn,
  asyncMiddleware(async (req, res) => {
    const grants = await Grant.findAll({
      where: { userId: req.user.id },
      include: [{ model: Transfer }]
    })

    const transfers = []
    grants.forEach(grant => {
      grant.Transfers.forEach(transfer => {
        transfers.push(transfer.get({ plain: true }))
      })
    })

    res.json(transfers)
  })
)

/**
 * Transfers tokens from hot wallet to address of user's choosing.
 */
router.post(
  '/transfers',
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
      const enqueuedTransfer = enqueueTransfer({
        grantId,
        address,
        amount,
        ip: req.connection.remoteAddress
      })

      // TODO: update to be more useful, e.g. users email
      logger.info(`Grant ${grantId} transferred ${amount} OGN to ${address}`)
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
