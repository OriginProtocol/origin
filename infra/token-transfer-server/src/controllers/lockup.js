const express = require('express')
const router = express.Router()
const AsyncLock = require('async-lock')
const lock = new AsyncLock()
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const moment = require('moment')

const {
  asyncMiddleware,
  getEmployeeUnlockDate,
  getInvestorUnlockDate
} = require('../utils')
const { ensureLoggedIn } = require('../lib/login')
const { isValidTotp } = require('../validators')
const { Lockup } = require('../models')
const { getFingerprintData } = require('../utils')
const { encryptionSecret } = require('../config')
const { addLockup, confirmLockup } = require('../lib/lockup')
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
      .isInt({ min: 0 })
      .withMessage('Amount must be greater than 0'),
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

    const unlockDate = req.user.employee
      ? getEmployeeUnlockDate()
      : getInvestorUnlockDate()
    if (moment.utc() < unlockDate) {
      res
        .status(422)
        .send(`Tokens are still locked. Unlock date is ${unlockDate}`)
      return
    }

    const { amount } = req.body

    let lockup
    try {
      await lock.acquire(req.user.id, async () => {
        lockup = await addLockup(
          req.user.id,
          amount,
          await getFingerprintData(req)
        )
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

/*
 * Confirm a lockup using the email token link.
 */
router.post(
  '/lockups/:id',
  [
    check('token')
      .not()
      .isEmpty(),
    ensureLoggedIn
  ],
  asyncMiddleware(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ errors: errors.array({ onlyFirstError: true }) })
    }

    let decodedToken
    try {
      decodedToken = jwt.verify(req.body.token, encryptionSecret)
    } catch (error) {
      logger.error(error)
      if (error.name === 'TokenExpiredError') {
        return res.status(400).send('Token has expired')
      }
      return res.status(400).send('Could not decode email confirmation token')
    }

    if (decodedToken.lockupId !== Number(req.params.id)) {
      return res.status(400).end('Invalid lockup id')
    }

    const lockup = await Lockup.findOne({
      where: { id: decodedToken.lockupId, userId: req.user.id }
    })
    if (!lockup) {
      return res.status(404)
    }

    try {
      await confirmLockup(lockup, req.user)
    } catch (e) {
      return res.status(422).send(e.message)
    }

    return res
      .status(201)
      .json(lockup.get({ plain: true }))
      .end()
  })
)

module.exports = router
