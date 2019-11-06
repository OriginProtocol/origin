'use strict'

const express = require('express')
const router = express.Router()
const Sequelize = require('sequelize')
const Op = Sequelize.Op

const Identity = require('@origin/identity/src/models').Identity

const { getExchangeRates } = require('../utils/exchange-rate')

/* This method is used for determining if an email or phone has previously
 * been used to create an identity, and so is likely to be excluded from Origin
 * Rewards during fraud/duplicate detection.
 *
 * Returns 204 if the email or phone is fine, or 200 if it exists on another
 * account.
 */
router.post('/exists', async (req, res) => {
  const or = []
  if (req.body.email) {
    or.push({ email: req.body.email })
  }
  if (req.body.phone) {
    or.push({ phone: req.body.phone })
  }
  if (or.length === 0) {
    res.sendStatus(400).end()
    return
  }

  const results = await Identity.findAll({
    where: {
      [Op.or]: or
    },
    order: [['createdAt', 'ASC']]
  })

  if (results.length > 0 && req.body.ethAddress) {
    // If eth address is given and the first identity found ordered by created_at
    // is the given eth address then return 204
    const firstResult = results[0]
    if (
      firstResult.ethAddress.toLowerCase() === req.body.ethAddress.toLowerCase()
    ) {
      res.sendStatus(204)
    } else {
      res.sendStatus(200)
    }
  } else if (results.length === 0) {
    res.sendStatus(204)
  } else {
    res.sendStatus(200)
  }
  res.end()
})

/**
 * Returns exchange rate of given market
 */
router.get('/exchange-rate', async (req, res) => {
  if (!req.query.market) {
    return res.status(400).send({
      errors: ['Field market is required']
    })
  }

  return res.status(200).send({
    price: await getExchangeRates(req.query.market)
  })
})

/**
 * Returns exchange rates of all markets
 */
router.get('/exchange-rates', async (req, res) => {
  return res.status(200).send(await getExchangeRates())
})

module.exports = router
