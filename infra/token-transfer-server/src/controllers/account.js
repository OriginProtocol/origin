const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const request = require('superagent')

const { asyncMiddleware } = require('../utils')
const { ensureLoggedIn } = require('../lib/login')
const {
  isEthereumAddress,
  isExistingAddress,
  isExistingNickname
} = require('../validators')
const { Account } = require('../models')
const logger = require('../logger')

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

    // Add account address to Wallet Insights. Only logs a warning on failure,
    // doesn't block the account add action.
    request
      .post('https://www.originprotocol.com/mailing-list/join')
      .send(`email=${req.user.email}`)
      .send(`investor=1`)
      .send(`eth_address=${req.body.address}`)
      .send(`name=${req.user.name || req.user.email}`)
      .then(
        response => {
          if (response.body.success) {
            logger.info(
              `Added ${req.body.address} to wallet insights for ${req.user.email}`
            )
          } else {
            logger.warn(
              `Could not add ${req.body.address} to wallet insights for ${req.user.email}: ${response.body.message}`
            )
          }
        },
        error => {
          logger.warn(
            `Could not add ${req.body.address} to wallet insights for ${req.user.email}: ${error.response.body}`
          )
        }
      )

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
