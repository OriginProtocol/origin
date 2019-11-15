const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const moment = require('moment')
const AsyncLock = require('async-lock')
const lock = new AsyncLock()
const jwt = require('jsonwebtoken')

const { Transfer } = require('../../src/models')
const { ensureLoggedIn } = require('../lib/login')
const {
  asyncMiddleware,
  getEmployeeUnlockDate,
  getFingerprintData,
  getInvestorUnlockDate
} = require('../utils')
const { isEthereumAddress, isValidTotp } = require('../validators')
const { encryptionSecret } = require('../config')
const { addTransfer, confirmTransfer } = require('../lib/transfer')
const logger = require('../logger')

/*
 * Returns transfers for the authenticated user.
 */
router.get(
  '/transfers',
  ensureLoggedIn,
  asyncMiddleware(async (req, res) => {
    const transfers = await Transfer.findAll({
      where: { userId: req.user.id },
      order: [['created_at', 'DESC']]
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
      .isInt({ min: 0 })
      .withMessage('Amount must be greater than 0'),
    check('address').custom(isEthereumAddress),
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
      logger.warn(`Transfer attempted by ${req.user.email} before unlock date`)
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
      logger.info(
        `User ${req.user.email} queued a transfer for ${amount} OGN to ${address}`
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
 * Confirm a transfer request using the email token link and change the state
 * to enqueued.
 */
router.post(
  '/transfers/:id',
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
      if (error.name === 'TokenExpiredError') {
        logger.warn(
          `Transfer attempted by ${req.user.email} with expired token`
        )
        return res.status(400).send('Token has expired')
      }
      logger.error(error)
      return res.status(400).send('Could not decode email confirmation token')
    }

    if (decodedToken.transferId !== Number(req.params.id)) {
      return res.status(400).end('Invalid transfer id')
    }

    const transfer = await Transfer.findOne({
      where: { id: decodedToken.transferId, userId: req.user.id }
    })
    if (!transfer) {
      return res.status(404)
    }

    try {
      await confirmTransfer(transfer, req.user)
    } catch (e) {
      return res.status(422).send(e.message)
    }

    logger.info(`Transfer ${transfer.id} confirmed for ${req.user.email}`)

    return res
      .status(201)
      .json(transfer.get({ plain: true }))
      .end()
  })
)

module.exports = router
