const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const moment = require('moment')
const AsyncLock = require('async-lock')
const lock = new AsyncLock()

const logger = require('../logger')
const { Transfer } = require('../../src/models')
const { ensureLoggedIn } = require('../lib/login')
const {
  asyncMiddleware,
  isEthereumAddress,
  isValidTotp,
  getFingerprintData,
  getUnlockDate,
  hasBalance
} = require('../utils')
const { unlockDate } = require('../config')
const { addTransfer, confirmTransfer } = require('../lib/transfer')

/*
 * Returns transfers for the authenticated user.
 */
router.get(
  '/transfers',
  ensureLoggedIn,
  asyncMiddleware(async (req, res) => {
    const transfers = await Transfer.findAll({
      where: { userId: req.user.id }
    })
    res.json(transfers.map(transfer => transfer.get({ plain: true })))
  })
)

/**
 * Add a transfer request to the database.
 */
router.post(
  '/transfers',
  [
    check('amount')
      .isNumeric()
      .toInt()
      .custom(hasBalance),
    check('address').custom(isEthereumAddress),
    ensureLoggedIn
  ],
  asyncMiddleware(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ errors: errors.array({ onlyFirstError: true }) })
    }

    if (moment() < getUnlockDate()) {
      res
        .status(422)
        .send(`Tokens are still locked. Unlock date is ${unlockDate}`)
      return
    }

    const { address, amount } = req.body

    let transfer
    try {
      await lock.acquire(req.user.id, async () => {
        transfer = await addTransfer(
          req.user.id,
          address,
          amount,
          await getFingerprintData(req)
        )
      })
      // TODO: update to be more useful, e.g. users email
      logger.info(
        `User ${req.user.email} transferred ${amount} OGN to ${address}`
      )
    } catch (e) {
      if (e instanceof ReferenceError || e instanceof RangeError) {
        res.status(422).send(e.message)
      } else {
        throw e
      }
    }
    res.status(201).json(transfer.get({ plain: true }))
  })
)

/*
 * Confirm a transfer request using 2fa and enqueue it.
 */
router.post(
  '/transfers/:id',
  [check('code').custom(isValidTotp), ensureLoggedIn],
  asyncMiddleware(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ errors: errors.array({ onlyFirstError: true }) })
    }

    const transfer = await Transfer.findOne({ where: { id: req.params.id } })
    if (!transfer) {
      return res.status(404)
    }

    try {
      await confirmTransfer(transfer)
    } catch (e) {
      return res.status(422).send(e.message)
    }

    return res.status(201).end()
  })
)

module.exports = router
