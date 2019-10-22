const express = require('express')
const router = express.Router()
const AsyncLock = require('async-lock')
const lock = new AsyncLock()
const { check, validationResult } = require('express-validator')

const { asyncMiddleware } = require('../utils')
const { hasBalance, isValidTotp } = require('../validators')
const { ensureLoggedIn } = require('../lib/login')
const { Lockup } = require('../models')
const { addLockup } = require('../lib/lockup')
const logger = require('../logger')

/**
 * Returns lockups for the authenticated user.
 */
router.get(
  '/lockups',
  ensureLoggedIn,
  asyncMiddleware(async (req, res) => {
    const lockups = await Lockup.findAll({ where: { userId: req.user.id } })
    res.json(
      lockups.map(lockup => {
        return lockup.get({ plain: true })
      })
    )
  })
)

/**
 * Add a new lockup.
 */
router.post(
  '/lockups',
  [
    check('amount')
      .isNumeric()
      .toInt()
      .custom(hasBalance),
    check('code').custom(isValidTotp),
    ensureLoggedIn
  ],
  asyncMiddleware(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ errors: errors.array({ onlyFirstError: true }) })
    }

    const { amount } = req.body

    let lockup
    try {
      await lock.acquire(req.user.id, async () => {
        lockup = await addLockup(req.user.id, amount)
      })
      logger.info(`User ${req.user.email} added a lockup of ${amount} OGN`)
    } catch (e) {
      if (e instanceof ReferenceError || e instanceof RangeError) {
        res.status(422).send(e.message)
      } else {
        throw e
      }
    }
    res.status(201).json(lockup.get({ plain: true }))
  })
)

module.exports = router
