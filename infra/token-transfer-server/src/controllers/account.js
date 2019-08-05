const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')

const { ensureLoggedIn } = require('../lib/login')
const { asyncMiddleware, isEthereumAddress } = require('../utils')
const { Account } = require('../models')

/**
 * Return users accounts.
 */
router.get(
  '/accounts',
  asyncMiddleware(ensureLoggedIn),
  asyncMiddleware(async (req, res) => {
    const accounts = await Account.findAll({
      where: { userId: req.session.user.id }
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
    check('nickname').isString(),
    check('address').custom(isEthereumAddress),
    asyncMiddleware(ensureLoggedIn)
  ],
  asyncMiddleware(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    const nicknameExists = await Account.findOne({
      where: {
        userId: req.session.user.id,
        nickname: req.body.nickname
      }
    })

    if (nicknameExists) {
      res.status(422).json({
        errors: ['You already have an account with that nickname']
      })
      return
    }

    const addressExists = await Account.findOne({
      where: {
        userId: req.session.user.id,
        address: req.body.address
      }
    })
    if (addressExists) {
      res.status(422).json({
        errors: ['You already have an account with that address']
      })
      return
    }

    const account = await Account.create({
      userId: req.session.user.id,
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
  asyncMiddleware(ensureLoggedIn),
  asyncMiddleware(async (req, res) => {
    const account = await Account.findOne({
      where: { id: req.params.accountId, userId: req.session.user.id }
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
