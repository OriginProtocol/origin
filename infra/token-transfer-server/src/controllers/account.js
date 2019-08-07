const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')

const { ensureLoggedIn } = require('../lib/login')
const {
  asyncMiddleware,
  isEthereumAddress,
  isExistingAddress,
  isExistingNickname
} = require('../utils')
const { Account } = require('../models')

/**
 * Return users accounts.
 */
router.get(
  '/accounts',
  ensureLoggedIn,
  asyncMiddleware(async (req, res) => {
    const accounts = await Account.findAll({
      where: { userId: req.user.id }
    })
    res.json(accounts.map(a => a.get({ plain: true })))
  })
)

/**
 * Add an account.
 */
router.post(
  '/accounts',
  [
    check('nickname')
      .isString()
      .custom(isExistingNickname),
    check('address')
      .custom(isEthereumAddress)
      .custom(isExistingAddress),
    ensureLoggedIn
  ],
  asyncMiddleware(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res
        .status(422)
        .json({ errors: errors.array({ onlyFirstError: true }) })
    }

    const account = await Account.create({
      userId: req.user.id,
      nickname: req.body.nickname,
      address: req.body.address
    })

    res.status(201).json(account.get({ plain: true }))
  })
)

/**
 * Delete an account
 */
router.delete(
  '/accounts/:accountId',
  ensureLoggedIn,
  asyncMiddleware(async (req, res) => {
    const account = await Account.findOne({
      where: { id: req.params.accountId, userId: req.user.id }
    })
    if (!account) {
      res.status(404).end()
    } else {
      await account.destroy()
      res.status(204).end()
    }
  })
)

module.exports = router
